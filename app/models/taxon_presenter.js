var urlHelper = require('url');

var Taxon = require('./taxon.js');
var Breadcrumbs = require('../../lib/js/breadcrumbs.js');

class TaxonPresenter {
  constructor(taxonParam) {
    this.basePath = taxonParam;
  }

  build() {
    return Promise.resolve(this)
      .then(function(presentedTaxon) {
        return presentedTaxon.buildTaxon()
          .then(function (taxon) {
            presentedTaxon.taxon = taxon;
            return Promise.all([
              presentedTaxon.buildBreadcrumb(),
              presentedTaxon.buildChildren(),
              presentedTaxon.buildContent()
            ])
              .then(function ([breadcrumbs, children, guidanceContent]) {
                presentedTaxon.title = taxon.title;
                presentedTaxon.description = taxon.description;
                // TODO: The breadcrumbs will return the current item as the last item in the array, but this is currently
                // handled elsewhere in the prototype. We should remove that special handling, and use the full breadcrumbs
                // from here. For now, just remove the last item from the array
                presentedTaxon.breadcrumb = breadcrumbs.slice(0, -1);
                presentedTaxon.children = children;
                presentedTaxon.content = {
                  guidance: guidanceContent
                };
                presentedTaxon.buildParent();
                presentedTaxon.checkIfPenultimate();

                return presentedTaxon.checkIfPenultimate()
                  .then(function (isPenultimate) {
                    presentedTaxon.isPenultimate = isPenultimate;
                    return presentedTaxon;
                  });
              });
          });
      });
  }

  buildTaxon() {
    return Taxon.fromBasePath(this.basePath);
  }

  buildBreadcrumb() {
    return Breadcrumbs.forBasePath(this.basePath);
  }

  buildParent() {
    this.parent = this.breadcrumb[this.breadcrumb.length - 1];
  }

  buildChildren() {
    return this.taxon.atozChildren()
      .then(function (children) {
        var childrenPromises = children.map(function (child) {
          return child.filterByHeading('guidance')
            .then(function (filteredChild) {
              child.guidance = filteredChild;
              return child;
            });
        });

        return Promise.all(childrenPromises);
      });
  }

  buildContent() {
    return this.taxon.filterByHeading('guidance');
  }

  checkIfPenultimate() {
    var grandchildPromises = this.children.map(function (child) {
      return child.atozChildren();
    });

    return Promise.all(grandchildPromises).then(function (childrensChildren) {
      return childrensChildren.every(function (childsChildren) {
        return !childsChildren.length;
      });
    });
  }

  isRootTaxon() {
    return this.parent.title === 'Home';
  }
}

module.exports = TaxonPresenter;
