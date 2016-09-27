var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var expressNunjucks = require('express-nunjucks');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);
var BreadcrumbMaker = require('../lib/js/breadcrumb_maker.js');

(function(){
  "use strict";

  var metadata;
  var breadcrumbMaker;
  getMetadata().then(function(metadataResult) {
    metadata = metadataResult;
    breadcrumbMaker = new BreadcrumbMaker(metadata);
  });

  router.get('/', function (req, res) {
    res.render('index', {homepage_url: '/'});
  });

  router.get('/alpha-taxonomy/:taxons', function (req, res) {
    var taxonName = req.params.taxons;
    console.log("Taxon page for: %s", taxonName);
    var url = "/alpha-taxonomy/" + taxonName;
    var taxon = Taxon.fromMetadata(url);
    var breadcrumb = breadcrumbMaker.getBreadcrumbForTaxon([url]);
    res.render('taxonomy', {taxon: taxon, homepage_url: '/', breadcrumb: breadcrumb});
  });

  router.get('/static-service/', function (req, res) {
      res.render('service');
  });

  router.get(/\/.+/, function (req, res) {
    var url = req.url;
    url = url.slice(1, url.length); // base path without leading slash
    var basename = url.replace(/\//g, '_');

    var content;
    var directory = __dirname + '/content/';

    var globPage = glob(directory + "/**/" + basename + ".html");

    globPage.then(function (file) {
      var filePath = file[0];
      return filePath;
    }).then(function(filePath) {
      readFile(filePath).then(function(data) {
        content = data.toString();
        var whitehall = filePath.match(/whitehall/);
        var html_publication = content.match(/html-publications-show/);
        var breadcrumb;
        var taxons;

        if (!html_publication) {
          // Skip breadcrumbs and taxons for HTML publications since they have a unique format
          breadcrumb = breadcrumbMaker.getBreadcrumbForContent(url);
          taxons = getTaxons(url);
        }

        res.render('content', { content: content, breadcrumb: breadcrumb, taxons: taxons, whitehall: whitehall, homepage_url: '/'});
      },
      function (e) {
        res.status(404).render('404');
      });
    });
  });

  function getMetadata() {
    return readFile('app/data/metadata_and_taxons.json').catch(function(err){
        console.log('Failed to read metadata and taxons.');
    }).then(function(data) {
      return JSON.parse(data);
    });
  }

  function getTaxons(url) {
    try
    {
      return metadata.taxons_for_content[url].map(function(taxonBasePath) {
        return Taxon.fromMetadata(taxonBasePath);
      });
    }
    catch(e){
      console.log("Problem getting taxons for sidebar");
    }
  }

  /*
    Object to describe the structure of a taxon
    (its child taxons and the documents tagged to it)
  */
  class Taxon {
    constructor(title, basePath, description) {
      this.title = title;
      this.basePath = basePath;
      this.description = description;
      this.content = [];
      this.children = [];
    }

    addContent(content) {
      this.content.push(content);
    }

    addChild(taxon) {
      this.children.push(taxon);
    }

    popularContent(maxDocuments) {
      return this.content.slice(0, maxDocuments);
    }

    atozContent(maxDocuments) {
      return this.content.sort(function(a, b) {
        return a.title > b.title;
      }).slice(0, maxDocuments);
    }

    recentContent(maxDocuments) {
      return this.content.sort(function(a, b) {
        return b.publicTimestamp.getTime() - a.publicTimestamp.getTime();
      }).slice(0, maxDocuments);
    }

    atozChildren() {
      return this.children.sort(function(a, b) {
        return a.title > b.title;
      });
    }

    static fromMetadata(basePath) {
      var taxonInformation = metadata.taxon_information[basePath];
      if (taxonInformation === undefined) {
        console.log("Missing taxon information for %s", basePath);
        return null;
      }

      var taxon = new Taxon(taxonInformation.title, basePath, taxonInformation.description);
      var contentItems = metadata.documents_in_taxon[basePath].results;
      var childTaxons = metadata.children_of_taxon[basePath];

      contentItems.forEach(function(contentItem) {
        var publicTimestamp = contentItem.public_timestamp;

        // Manual sections are missing a public timestamp: make one up
        if (publicTimestamp === undefined) {
            console.log("Made up timestamp for %s %s", contentItem.format, contentItem.link);
            publicTimestamp = '2016-01-01T00:00:00+00:00';
        }

        taxon.addContent({title: contentItem.title, basePath: contentItem.link, format: contentItem.format, publicTimestamp: new Date(publicTimestamp)});
      });

      childTaxons.forEach(function(childTaxonBasePath) {
        var childTaxon = Taxon.fromMetadata(childTaxonBasePath);
        if (childTaxon !== null) {
          taxon.addChild(childTaxon);
        }
      });

      return taxon;
    }
  }

  module.exports = router;

})();
