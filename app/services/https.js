"use strict";

var https = require('https');
var querystring = require('querystring');
var Promise = require('bluebird');

/**
 * A class that simplifies the node.js https API, which is slightly unwieldy.
 */
class Https {

  /**
   * Performs an HTTPS GET request and returns a promise which resolves the response body as a JSON object. It takes an
   * options argument that is passed directly to the node.js https.get method, and hence accepts exactly that format.
   *
   * An example call might look like:
   * https.get('https://gov.uk')
   *   .then(function (responseBody) {
   *     // Do something with responseBody
   *   })
   *   .catch(function (response) {
   *     // Something went wrong
   *   });
   *
   * @param options HTTPS GET options object, as you would pass into the node.js https.get method
   */
  static get(options) {
    return new Promise(function (resolve, reject) {
      https.get(options, function (response) {
        var responseBody = '';

        response.on('data', function (data) {
          responseBody += data;
        });

        response.on('end', function () {
          validateStatusCode();
          parseResponseAsJson();
        });

        response.on('error', reject);

        function validateStatusCode() {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            fail();
          }
        }

        function parseResponseAsJson() {
          try {
            var json = JSON.parse(responseBody);
            resolve(json);
          } catch (error) {
            fail("Could not parse response as JSON");
          }
        }

        function fail(message) {
          reject(
            `Error fetching  ${options.host}${options.path}
             HTTP Status Code: ${response.statusCode}
             ${message || ''}
             === RESPONSE BODY ===
             ${responseBody}
             === END RESPONSE BODY ===`
          );
        }
      });
    });
  }
}

module.exports = Https;
