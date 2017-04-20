"use strict";

var https = require('./https');

/**
 * A service for interaction with the content store running outside the prototype, making real HTTPS requests.
 */
class ContentStore {

  /**
   * Fetches a content item from the content store
   *
   * @param basePath the base path of a content item to fetch
   * @returns a promise that resolves the content store response for the given content item
   */
  static contentItem(basePath) {
    if (!basePath.startsWith('/')) {
      basePath = '/' + basePath;
    }

    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + basePath
    });
  }
}

module.exports = ContentStore;
