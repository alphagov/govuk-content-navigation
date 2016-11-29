var fs = require('fs');
var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);

class RelatedContent {
  static get (contentBasePath) {
    var readSourceData = readFile('app/data/hardcoded_related_content.json');

    return readSourceData.
      then(function (data) {
        var lookup = JSON.parse(data);

        return lookup[contentBasePath];
      });
  }
}

module.exports = RelatedContent;
