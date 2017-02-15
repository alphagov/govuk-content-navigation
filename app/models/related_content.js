var fs = require('fs');
var process = require('process');
var https = require('https');
var querystring = require('querystring');
var Promise = require('bluebird');
var TaxonomyData = require('./taxonomy_data.js');
var readFile = Promise.promisify(fs.readFile);
var Taxon = require('./taxon.js');

class RelatedContent {
  static esRelatedLinks (contentBasePath, parentTaxon) {
    var queryParams = {
      similar_to: contentBasePath,
      start: 0,
      count: 5,
      filter_taxons: [parentTaxon],
      fields: 'title,description,link'
    }
    var queryString = querystring.stringify(queryParams);
    var path = "/api/search.json?" + queryString;

    return new Promise((resolve, reject) =>
      https.get({
        host: 'www.gov.uk',
        path: path,
      }, function (response) {
        var body = '';

        response.on('data', function (d) {
            body += d;
        });

        response.on('end', function () {
          var parsed = JSON.parse(body);
          var data = parsed.results;

          resolve(data);
        });

        response.on('error', reject);
      })
    );
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
        return that.esRelatedLinks(contentBasePath, parentTaxon.contentId).then(function (results) {
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
