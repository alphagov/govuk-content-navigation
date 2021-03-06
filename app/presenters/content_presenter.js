var _ = require('lodash');
var fs = require('fs');
var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);
var glob = Promise.promisify(require('glob'));

var RelatedContent = require('../models/related_content.js');
var Breadcrumbs = require('../services/breadcrumbs.js');
var cheerio = require('cheerio');
var https = require('../services/https');

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
            breadcrumb: breadcrumb,
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
    return Breadcrumbs.fromBasePath(basePath);
  }

  getTaxonsPromise () {
    const basePath = '/' + this.basePath;

    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + basePath
    })
      .then(function (contentItem) {
        var links = contentItem.links || [];
        return links.taxons || [];
      });
  }
}

module.exports = ContentPresenter;
