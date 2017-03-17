var fs = require('fs');
var Promise = require('bluebird');
var SearchService = require('./search_service');
var TaxonomyData = require('./taxonomy_data.js');
var readFile = Promise.promisify(fs.readFile);
var Taxon = require('./taxon.js');
var GuidanceContent = require('./guidance_content');

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

  static allTaxonsPromise () {
    var readSourceData = readFile('app/data/taxons.json');

    return readSourceData.
      then(function (data) {
        return JSON.parse(data);
      });
  }

  static get (contentBasePath) {
    var that = this;
    var allTaxons = this.allTaxonsPromise();
    var parentTaxonsPromise = allTaxons.then(function (taxons) {
      return TaxonomyData.get().
        then(function (metadata) {
          return metadata.taxons_for_content[contentBasePath.slice(1)].map(function (taxonBasePath) {
            var parentTaxon = taxons.find(function (taxon) {
              return taxon.base_path == taxonBasePath;
            });
            var contentItem = Taxon.fromMetadata(taxonBasePath, metadata);
            contentItem.contentId = parentTaxon.content_id;

            return contentItem;
          })
        });
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
