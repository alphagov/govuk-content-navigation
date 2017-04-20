"use strict";

var ContentStore = require('../services/content_store');
var SearchService = require('../services/search_service');

/**
 * This class is an asynchronous representation of a taxon, which acts as a Promise builder.
 *
 * Example usage:
 *
 *   Taxon.fromBasePath('/education')
 *     .withChildren()
 *     .asPromise()
 *     .then(function (taxon) {
 *       // We are now guaranteed have taxon.children available:
 *       taxon.children.forEach(doSomething);
 *     });
 *
 * This behaviour is achieved with an array of Promises that are resolved before invoking the callback. This promises
 * are built up using the provided convenience methods such as .withChildren(), which will add a promise to the list
 * of promises that must be resolved before the callback is invoked.
 */
class Taxon {
  static fromBasePath(basePath) {
    return new Taxon(basePath);
  }

  constructor(basePath) {
    this.basePath = basePath;
    this.promises = [];
  }

  /**
   * @returns Promise that will resolve to a Taxon with the requested fields available
   */
  asPromise() {
    var taxon = this;
    return Promise.all(this.promises)
      .then(function () {
        return taxon;
      });
  }

  /**
   * @returns a Taxon object which will resolve with the Content Store representation of the Taxon
   */
  withContentItem() {
    var taxon = this;
    return this.resolveIfNeeded({
      key: 'contentItem',
      promise: () => ContentStore.contentItem(taxon.basePath)
        .then(function (contentItem) {
          taxon.contentItem = contentItem;
        })
    });
  }

  /**
   * @returns a Taxon object which will resolve with its children
   */
  withChildren() {
    var taxon = this;
    return this.resolveIfNeeded({
      key: 'children',
      dependencies: this.withContentItem(),
      promise: (taxonWithContentItem) => {
        var links = taxonWithContentItem.contentItem.links || {};
        var childTaxons = links.child_taxons || [];
        taxon.children = childTaxons.map(function (childTaxon) {
          return Taxon.fromBasePath(childTaxon.base_path);
        })
      }
    });
  }

  /**
   * This method ensures the children of the Taxon are available on the Taxon object when the callback .then()
   * function is called. It will also perform an operation on each child, defined by the provided mappingPromise, and
   * ensure that those promises have all resolved when the callback function is invoked.
   *
   * Example usage:
   *
   *   Taxon.fromBasePath('/education')
   *     .eachChild(function (child) {
   *       // This would ensure all children have their content store representations available in .then()
   *       return child.withContentItem().asPromise();
   *     })
   *     .asPromise()
   *     .then(function (taxon) {
   *       // Each taxon child now has its content store representation available
   *       taxon.children.forEach(function(child) {
   *         console.log(child.contentItem);
   *       });
   *     });
   *
   * @param mappingPromise a Promise that accepts a Taxon child as an argument
   * @returns a Taxon object which will resolve with the children, having been manipulated by mappingPromise
   */
  eachChild(mappingPromise) {
    return this.resolveIfNeeded({
      key: mappingPromise,
      dependencies: this.withChildren(),
      promise: (taxonWithChildren) => {
        var promises = taxonWithChildren.children.map(function (child) {
          return mappingPromise(child);
        });

        return Promise.all(promises);
      }
    })
  }

  /**
   * @returns Taxon which will resolve with its tagged content items
   */
  withTaggedContent() {
    var taxon = this;
    return this.resolveIfNeeded({
      key: 'taggedContent',
      dependencies: this.withContentItem(),
      promise: (taxonWithContentItem) => {
        return SearchService.search({
          fields: [
            'content_store_document_type',
            'title',
            'public_timestamp',
            'link',
            'document_collections',
            'description'
          ],
          count: 1000,
          filter_taxons: [taxonWithContentItem.contentItem.content_id]
        }).then(function (searchResponse) {
          taxon.taggedContent = searchResponse.results;
        });
      }
    })
  }

  /**
   * This method will resolve the provided promise, unless it's already enqueued.
   * @param options:
   * {
   *   key: 'string',      // The key at which the requested property will be available
   *   promise: Function,  // A function (that may be a Promise) that will be queued to resolve before the callback
   *   dependencies: Taxon // a Taxon object with the required dependencies resolved
   * }
   * @returns Taxon object which will only resolve once the provided promise has resolved
   */
  resolveIfNeeded(options) {
    var key = options.key;
    var promise = options.promise;
    var taxon = options.dependencies || this;

    if (!taxon.hasOwnProperty(key)) {
      // Store a temporary null in this key to prevent multiple invocations of the same promise
      taxon[key] = null;
      taxon.promises.push(taxon.asPromise().then(promise));
    }

    return taxon;
  }
}

module.exports = Taxon;
