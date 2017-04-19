var fs = require('fs');
var Promise = require('bluebird');
var SearchService = require('./search_service');
var Taxon = require('./taxon.js');
var GuidanceContent = require('./guidance_content');
var https = require('./https');

class RelatedContent {
  static esRelatedLinks (contentBasePath, parentTaxon) {
    return SearchService.search({
      similar_to: contentBasePath,
      start: 0,
      count: 5,
      filter_taxons: [parentTaxon],
      filter_content_store_document_type: GuidanceContent.guidanceDocumentTypes(),
      fields: 'title,description,link'
    });
  }

  static get (contentBasePath) {
    var that = this;

    var parentTaxonsPromise = https.get({
      host: 'www.gov.uk',
      path: '/api/content' + contentBasePath
    })
      .then(function (contentItem) {
        var links = contentItem.links || [];
        var taxons = links.taxons || [];

        var taxonPromises = taxons.map(function (taxon) {
          return Taxon.fromBasePath(taxon.base_path);
        });

        return Promise.all(taxonPromises);
      });

    return parentTaxonsPromise.then(function (parentTaxons) {
      var searchResults = parentTaxons.map(function (parentTaxon) {
        return that.esRelatedLinks(contentBasePath, parentTaxon.contentId).then(function (searchResponse) {
          var results = searchResponse.results;
          return {
            results: results,
            basePath: parentTaxon.basePath,
            title: parentTaxon.title,
            contentId: parentTaxon.contentId,
            description: parentTaxon.description
          };
        });
      });

      return Promise.all(searchResults);
    });
  }
}

module.exports = RelatedContent;
