var urlHelper = require('url');

var Taxon = require('./taxon.js');
var Breadcrumbs = require('../../lib/js/breadcrumbs.js');
var TaxonomyData = require('./taxonomy_data.js');

class TaxonPresenter {
  constructor(taxonParam) {
    this.basePath = taxonParam;
  }

  build() {
    return Promise.resolve(this)
      .then(function(presentedTaxon) {
        return Promise.all([TaxonomyData.get(), presentedTaxon.buildBreadcrumb()])
          .then(function (promises) {
            var taxonomyData = promises[0];
            var breadcrumbs = promises[1];

            presentedTaxon.taxonomyData = taxonomyData;
            // TODO: The breadcrumbs will return the current item as the last item in the array, but this is currently
            // handled elsewhere in the prototype. We should remove that special handling, and use the full breadcrumbs
            // from here. For now, just remove the last item from the array
            presentedTaxon.breadcrumb = breadcrumbs.slice(0, -1);
            presentedTaxon.buildTaxon();
            presentedTaxon.buildParent();
            presentedTaxon.buildChildren();
            presentedTaxon.buildContent();
            presentedTaxon.checkIfPenultimate();

            return presentedTaxon;
          });
      });
  }

  buildTaxon() {
    this.taxon = Taxon.fromMetadata(this.basePath, this.taxonomyData);
    this.title = this.taxon.title;
    this.description = this.taxon.description;
  }

  buildBreadcrumb() {
    return Breadcrumbs.forBasePath(this.basePath);
  }

  buildParent() {
    this.parent = this.breadcrumb[this.breadcrumb.length - 1];
  }

  buildChildren() {
    this.children = this.taxon.atozChildren().map(function (child) {
      child.guidance = child.filterByHeading('guidance');

      return child;
    });
  }

  buildContent() {
    this.content = {};
    this.content.guidance = this.taxon.filterByHeading('guidance');
  }

  checkIfPenultimate() {
    var hasChildren = (childTaxon) => childTaxon.children.length > 0;
    this.isPenultimate = !(this.children.find(hasChildren));
  }

  determineBackToLink(pageUrl) {
    var backTo = null;
    // The 'back to' link behaviour differs depending on whether we are showing
    // a leaf node taxon or a taxon higher up in the taxonomy.
    if (this.children.length > 0) {
      backTo = urlHelper.parse(pageUrl).pathname;
    } else {
      backTo = this.parent.basePath;
    }

    return backTo;
  }

  isRootTaxon() {
    return this.parent.title === 'Home';
  }
}

module.exports = TaxonPresenter;
