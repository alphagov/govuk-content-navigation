"use strict";

var ContentItem = require("./content_item.js");
var https = require('./https');
var SearchService = require('./search_service');

class Taxon {
  constructor(title, basePath, contentId, description, options) {
    this.title = title;
    this.basePath = basePath;
    this.contentId = contentId;
    this.description = description;
    if (typeof(options) === "undefined") {
      options = {};
    }
    this.content = options.content || [];
    this.children = options.children || [];
  }

  filterByHeading (headingId) {
    var taxon = this;

    var contentPromise = this.content.length
      ? Promise.resolve(this.content)
      : this.getContent();

    return contentPromise.then(function (content) {
      taxon.content = content;

      var filteredContent = content.filter(
        function (child) {
          var heading = child.getHeading();
          return heading !== null && heading.id === headingId;
        }
      );

      return new Taxon(
        taxon.title, taxon.basePath, taxon.contentId, taxon.description,
        {
          content: filteredContent,
          children: taxon.children
        }
      );
    });
  }

  getContent() {
    var taxon = this;

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
      filter_taxons: [taxon.contentId]
    })
      .then(function (contentItems) {
        return contentItems.results
          .map(function (contentItem) {
            var publicTimestamp = contentItem.public_timestamp;

            // Manual sections are missing a public timestamp: make one up
            if (typeof(publicTimestamp) === "undefined") {
              publicTimestamp = '2016-01-01T00:00:00+00:00';
            }

            return new ContentItem(
              contentItem.title,
              contentItem.link,
              contentItem.content_store_document_type,
              new Date(publicTimestamp),
              contentItem.description,
              contentItem.document_collections
            );
          })
          .filter(function (contentItem) {
            return !contentItem.isSubsection() && !contentItem.belongsToDocumentCollection();
          });
      });
  }

  popularContent (maxDocuments) {
    return this.content.slice(0, maxDocuments);
  }

  atozContent (maxDocuments) {
    var sorted = this.content.sort(function (a, b) {
      if (a.title > b.title) {
        return 1;
      }

      if (a.title < b.title) {
        return -1;
      }

      return 0;
    });

    if (typeof(maxDocuments) !== "undefined") {
      return sorted.slice(0, maxDocuments);
    }

    return sorted;
  }

  recentContent (maxDocuments) {
    return this.content.sort(function (a, b) {
      return b.publicTimestamp.getTime() - a.publicTimestamp.getTime();
    }).slice(0, maxDocuments);
  }

  atozChildren () {
    var childrenPromise = this.children.length
      ? Promise.resolve(this.children)
      : this.getChildren();

    return childrenPromise.then(function (children) {
      return children.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
    });
  }

  getChildren() {
    var taxon = this;

    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + taxon.basePath
    })
      .then(function (contentItem) {
        var links = contentItem.links || [];
        var childTaxons = links.child_taxons || [];

        return childTaxons.map(function (childTaxon) {
          return new Taxon(
            childTaxon.title,
            childTaxon.base_path,
            childTaxon.content_id,
            childTaxon.description
          );
        });
      });
  }

  static fromBasePath(basePath) {
    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + basePath
    })
      .then(function (contentItem) {
        return new Taxon(
          contentItem.title,
          contentItem.base_path,
          contentItem.content_id,
          contentItem.description
        );
      });
  }
}

module.exports = Taxon;
