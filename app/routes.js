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

  router.get('/become-childminder/', function (req, res) {
      res.render('become-a-childminder');
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
        var html_manual = filePath.match(/manual/);
        var html_publication = content.match(/html-publications-show/);
        var breadcrumb;
        var taxons;

        if (!html_publication) {
          // Skip breadcrumbs and taxons for HTML publications since they have a unique format
          breadcrumb = breadcrumbMaker.getBreadcrumbForContent(url);
          taxons = getTaxons(url);
        }

        var data = {
          content: content,
          publicTimestamp: metadata.document_metadata[url].public_updated_at,
          breadcrumb: breadcrumb,
          taxons: taxons,
          whitehall: whitehall,
          html_manual: html_manual,
          homepage_url: '/'
        };

        res.render('content', data);
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

    isOrganisation(basePath) {
      return basePath.includes("/organisations/");
    }

    addContent(content) {
      /*
      Currently we're tagging organisation home pages and about pages
      ("corporate information pages") to the taxonomy.

      We're not sure if this is the right thing to do because these pages are
      about the organisation themselves, not about the topic, even though
      the organisation may be relevant to the topic. For now, just ignore these
      tags, and don't mix these pages in with the rest of the content.
      This is a workaround until we change how the content is tagged.
      */
      if (!this.isOrganisation(content.basePath)) {
        this.content.push(content);
      }
    }

    addChild(taxon) {
      this.children.push(taxon);
    }

    popularContent(maxDocuments) {
      return this.content.slice(0, maxDocuments);
    }

    atozContent(maxDocuments) {
      var sorted = this.content.sort(function(a, b) {
        if (a.title > b.title) {
          return 1;
        }

        if (a.title < b.title) {
          return -1;
        }

        return 0;
      });

      if (maxDocuments !== undefined) {
        return sorted.slice(0, maxDocuments);
      } else {
        return sorted;
      }
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
