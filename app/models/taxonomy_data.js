var fs = require('fs');
var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);

class TaxonomyData {
  static get() {
    return readFile('app/data/taxonomy_data.json').
      then(function (data) {
        return JSON.parse(data);
      }).
      catch(function (err) {
        console.log('Failed to read metadata and taxons.');
      });
  }
}

module.exports = TaxonomyData;
