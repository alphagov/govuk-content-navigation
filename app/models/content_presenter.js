var _ = require('lodash');
var fs = require('fs');
var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);
var glob = Promise.promisify(require('glob'));

var RelatedContent = require('./related_content.js');
var Breadcrumbs = require('../../lib/js/breadcrumbs.js');
var Taxon = require('./taxon.js');
var cheerio = require('cheerio');
var https = require('./https');

class ContentPresenter {
  constructor (basePath) {
    this.basePath = basePath.slice(1, basePath.length); // base path without leading slash
    this.baseName = this.basePath.replace(/\//g, '_');
    this.contentDir = __dirname + "/../content"
  }

  present () {
    const that = this;

    return glob(that.contentDir + "/**/" + that.baseName + ".html").
      then(function (file) {
        const filePath = file[0];
        const fileInfo = readFile(filePath).then(function (fileData) {
          return {
            fileData: fileData,
            filePath: filePath
          };
        });

        return fileInfo
      }).
      then(function (fileInfo) {
        const content = fileInfo.fileData.toString();
        const filePath = fileInfo.filePath;

        var isWhitehall = filePath.match(/whitehall/);
        var isHtmlManual = filePath.match(/manual/);

        var content_dom = cheerio.load(content);
        var title = content_dom('h1').first().text();

        return Promise.all([
          that.getBreadcrumbPromise(),
          that.getTaxonsPromise(),
          that.getRelatedContentPromise(),
        ]).spread(function (breadcrumb, taxons, relatedContent) {
          return {
            title: title,
            content: content,
            // TODO: The breadcrumbs will return the current item as the last item in the array, but this is currently
            // handled elsewhere in the prototype. We should remove that special handling, and use the full breadcrumbs
            // from here. For now, just remove the last item from the array
            breadcrumb: breadcrumb.slice(0, -1),
            taxons: taxons,
            isWhitehall: isWhitehall,
            isHtmlManual: isHtmlManual,
            relatedContent: relatedContent,
          }
        });
      });
  }

  getRelatedContentPromise () {
    return RelatedContent.get("/" + this.basePath).
      then(function (relatedContent) {
        return _.sortBy(relatedContent, "title");
      });
  }

  getBreadcrumbPromise () {
    const basePath = '/' + this.basePath;
    return Breadcrumbs.forBasePath(basePath);
  }

  getTaxonsPromise () {
    const basePath = '/' + this.basePath;

    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + basePath
    })
      .then(function (contentItem) {
        var links = contentItem.links || [];
        var taxons = links.taxons || [];

        var taxonPromises = taxons.map(function (taxon) {
          return Taxon.fromBasePath(taxon.base_path);
        });

        return Promise.all(taxonPromises);
      });
  }
}

module.exports = ContentPresenter
