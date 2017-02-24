var querystring = require('querystring');
var https = require('https');
var Promise = require('bluebird');

class MainstreamContent {
  static forTaxonAndDescendants(taxonId) {

    var queryParams = {
      start: 0,
      count: 50,
      filter_part_of_taxonomy_tree: taxonId,
      filter_content_store_document_type: MainstreamContent.documentTypes(),
      fields: 'title,link'
    };

    var queryString = querystring.stringify(queryParams);
    var path = "/api/search.json?" + queryString;

    return new Promise((resolve, reject) =>
      https.get({
        host: 'www.gov.uk',
        path: path
      }, function (response) {
        var responseBody = '';

        response.on('data', function (d) {
          responseBody += d;
        });

        response.on('end', function () {
          var parsed = JSON.parse(responseBody);
          var results = parsed.results.sort(function (a, b) {
            return a.title.localeCompare(b.title);
          });

          resolve(results);
        });

        response.on('error', reject);
      })
    );
  }

  static documentTypes() {
    return [
      'answer',
      'calculator',
      'calendar',
      'guide',
      'local_transaction',
      'place',
      'programme',
      'simple_smart_answer',
      'smart_answer',
      'transaction'
    ];
  }
}

module.exports = MainstreamContent;
