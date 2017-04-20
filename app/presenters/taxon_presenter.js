"use strict";

var Taxon = require('../models/taxon.js');
var Breadcrumbs = require('../services/breadcrumbs');
var GuidanceContent = require('../services/guidance_content');

class TaxonPresenter {
  static build(basePath) {
    return TaxonPresenter.buildTaxon(basePath)
      .then(function (taxon) {
        return {
          contentItem: taxon.contentItem,
          taggedContent: taxon.taggedContent
            .filter(TaxonPresenter.isGuidance)
            .sort(TaxonPresenter.byTitle),
          children: taxon.children
            .sort(TaxonPresenter.byContentItemTitle),
          breadcrumbs: Breadcrumbs.fromContentItem(taxon.contentItem),
          hasGrandchildren: TaxonPresenter.hasGrandchildren(taxon)
        };
      });
  }

  static buildTaxon(basePath) {
    return Taxon.fromBasePath(basePath)
      .withTaggedContent()
      .eachChild(withTaggedGuidanceContent)
      .eachChild(withChildren)
      .asPromise();

    function withTaggedGuidanceContent(childTaxon) {
      return childTaxon
        .withTaggedContent()
        .asPromise()
        .then(function (taxonWithTaggedContent) {
          taxonWithTaggedContent.taggedContent = taxonWithTaggedContent.taggedContent
            .filter(TaxonPresenter.isGuidance)
            .sort(TaxonPresenter.byTitle);
        });
    }

    function withChildren(childTaxon) {
      return childTaxon.withChildren().asPromise();
    }
  }

  static hasGrandchildren(taxon) {
    return taxon.children
      && taxon.children.length
      && taxon.children.some(function (child) {
        return child.children && child.children.length;
      });
  }

  static isGuidance(contentItem) {
    return GuidanceContent.isGuidanceContent(contentItem.content_store_document_type);
  }

  static byContentItemTitle(a, b) {
    return a.contentItem.title.localeCompare(b.contentItem.title);
  }

  static byTitle(a, b) {
    return a.title.localeCompare(b.title);
  }

  // For now, the only valid theme is Education. There is no way of determining
  // taxon themes programatically yet, so they still need to be hardcoded.
  static isValidTheme(theme) {
    return ['education'].includes(theme);
  }
}

module.exports = TaxonPresenter;
