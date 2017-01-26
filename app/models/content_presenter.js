var fs = require('fs');
var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);
var glob = Promise.promisify(require('glob'));

var RelatedContent = require('./related_content.js');
var BreadcrumbMaker = require('../../lib/js/breadcrumb_maker.js');
var TaxonomyData = require('./taxonomy_data.js');
var Taxon = require('./taxon.js');
var cheerio = require('cheerio');

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
        var title = content_dom('.govuk-title h1').text();

        const presented = Promise.all([
          that.getBreadcrumbPromise(),
          that.getTaxonsPromise(),
          that.getRelatedContentPromise(),
        ]).spread(function (breadcrumb, taxons, relatedContent) {
          return {
            title: title,
            content: content,
            breadcrumb: breadcrumb,
            taxons: taxons,
            relatedContent: relatedContent,
            isWhitehall: isWhitehall,
            isHtmlManual: isHtmlManual,
          }
        })

        return presented;
      });
  }

  getBreadcrumbPromise () {
    const basePath = this.basePath

    return TaxonomyData.get().
      then(function (metadata) {
        var breadcrumbMaker = new BreadcrumbMaker(metadata);
        var breadcrumb = breadcrumbMaker.getBreadcrumbForContent(basePath);

        return breadcrumb;
      });
  }

  getTaxonsPromise () {
    const basePath = this.basePath

    return TaxonomyData.get().
      then(function (metadata) {
        return metadata.taxons_for_content[basePath].map(function (taxonBasePath) {
          return Taxon.fromMetadata(taxonBasePath, metadata);
        })
      });
  }

  getRelatedContentPromise () {
    return RelatedContent.get("/" + this.basePath).
      then(function (relatedContent) {
        return relatedContent;
      });
  }
}

module.exports = ContentPresenter
