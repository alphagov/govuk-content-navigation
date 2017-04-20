"use strict";

var https = require('./https');
var querystring = require('querystring');

/**
 * A service for interaction with a search service running outside the prototype, making real HTTPS requests.
 */
class SearchService {

  /**
   * Performs a search query against Rummager
   *
   * @param searchQuery an object of search parameters matching the Rummager API, or a simple string containing a
   * search query
   * @returns a promise that resolves the full Rummager response (an object containing "total", "results", etc.)
   */
  static search(searchQuery) {
    var searchQueryObject = SearchService.stringOrObjectToQueryObject(searchQuery);

    return https.get({
      host: 'www.gov.uk',
      path: '/api/search.json?' + querystring.stringify(searchQueryObject)
    });
  }

  /**
   * Perform a search query against Rummager and return the total number of results
   *
   * @param searchQuery an object of search parameters matching the Rummager API, or a simple string containing a
   * search query
   * @returns a promise that resolves the total number of results matching the query
   */
  static count(searchQuery) {
    var searchQueryObject = SearchService.stringOrObjectToQueryObject(searchQuery);
    searchQueryObject.count = 0; // Don't bother returning actual results

    return SearchService.search(searchQueryObject)
      .then(function (searchResponse) {
        return searchResponse.total;
      });
  }

  /**
   * Perform a taxonomy-scoped search against Rummager
   *
   * @param searchQuery an object of search parameters matching the Rummager API, or a simple string containing a
   * search query
   * @param parentTaxonId the taxon under which to perform the search
   * @returns a promise that resolves the full Rummager response (an object containing "total", "results", etc.)
   */
  static scopedSearch(searchQuery, parentTaxonId) {
    var queryObject = {
      count: 10,
      fields: [
        'title_with_highlighting',
        'description_with_highlighting',
        'link',
        'public_timestamp',
        'display_type',
        'organisations'
      ]
    };

    if (searchQuery) {
      queryObject.q = searchQuery;
    }

    if (parentTaxonId) {
      queryObject.filter_part_of_taxonomy_tree = parentTaxonId;
    }

    return SearchService.search(queryObject);
  }

  /**
   * Converts an argument that is a string or an object into a search query object
   *
   * @param stringOrObject either a plain text string or a search query object
   * @returns a search query object
   */
  static stringOrObjectToQueryObject(stringOrObject) {
    return typeof stringOrObject === 'object'
      ? stringOrObject
      : {q: stringOrObject};
  }
}

module.exports = SearchService;
