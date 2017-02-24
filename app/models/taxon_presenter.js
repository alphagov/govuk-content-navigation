var urlHelper = require('url');

var Taxon = require('./taxon.js');
var BreadcrumbMaker = require('../../lib/js/breadcrumb_maker.js');
var TaxonomyData = require('./taxonomy_data.js');
var MainstreamContent = require('./mainstream_content');

class TaxonPresenter {
  constructor (taxonParam) {
    this.basePath = taxonParam;
  }

  build () {
    return Promise.resolve(this)
      .then(function(presentedTaxon) {
        return TaxonomyData.get().then(
          function(taxonomyData) {
            presentedTaxon.taxonomyData = taxonomyData;
            presentedTaxon.buildTaxon();
            presentedTaxon.buildBreadcrumb();
            presentedTaxon.buildParent();
            presentedTaxon.buildChildren();
            presentedTaxon.buildContent();
            presentedTaxon.checkIfPenultimate();

            return presentedTaxon;
          }
        );
      })
      .then(function(presentedTaxon) {
        if (presentedTaxon.isRootTaxon()) {
          return Promise.resolve(presentedTaxon);
        } else {
          return MainstreamContent.forTaxonAndDescendants(presentedTaxon.taxon.contentId)
            .then(function (mainstreamContent) {
              presentedTaxon.mainstreamContent = mainstreamContent;
              return presentedTaxon;
            });
        }
      });
  }

  buildTaxon () {
    this.taxon = Taxon.fromMetadata(this.basePath, this.taxonomyData);
    this.title = this.taxon.title;
    this.description = this.taxon.description;
  }

  buildBreadcrumb () {
    var breadcrumbMaker = new BreadcrumbMaker(this.taxonomyData);
    this.breadcrumb =  breadcrumbMaker.getBreadcrumbForTaxon([this.basePath]);
  }

  buildParent () {
    this.parent = this.breadcrumb[this.breadcrumb.length - 1];
  }

  buildChildren () {
    this.children = this.taxon.atozChildren().map(function (child) {
      child.guidance = child.filterByHeading('guidance');

      return child;
    });
  }

  buildContent () {
    this.content = {};
    this.content.guidance = this.taxon.filterByHeading('guidance');
  }

  checkIfPenultimate () {
    var hasChildren = (childTaxon) => childTaxon.children.length > 0;
    this.isPenultimate = !(this.children.find(hasChildren));
  }

  determineBackToLink (pageUrl) {
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
