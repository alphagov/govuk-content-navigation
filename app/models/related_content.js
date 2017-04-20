var fs = require('fs');
var Promise = require('bluebird');
var SearchService = require('../services/search_service');
var GuidanceContent = require('../services/guidance_content');
var https = require('../services/https');

class RelatedContent {
  static esRelatedLinks(contentBasePath, parentTaxon) {
    return SearchService.search({
      similar_to: contentBasePath,
      start: 0,
      count: 5,
      filter_taxons: [parentTaxon],
      filter_content_store_document_type: GuidanceContent.guidanceDocumentTypes(),
      fields: 'title,description,link'
    });
  }

  static get(contentBasePath) {
    var that = this;

    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + contentBasePath
    })
      .then(function (contentItem) {
        var links = contentItem.links || [];
        var taxons = links.taxons || [];

        var searchResults = taxons.map(function (taxon) {
          return that.esRelatedLinks(contentBasePath, taxon.content_id).then(function (searchResponse) {
            var results = searchResponse.results;
            return {
              results: results,
              basePath: taxon.base_path,
              title: taxon.title,
              contentId: taxon.content_id,
              description: taxon.description
            };
          });
        });

        return Promise.all(searchResults);
      });
  }
}

module.exports = RelatedContent;
