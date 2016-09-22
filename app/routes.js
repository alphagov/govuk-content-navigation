var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var expressNunjucks = require('express-nunjucks');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);

(function(){
  "use strict";

  var metadata = getMetadata();

  router.get('/', function (req, res) {
    res.render('index', {homepage_url: '/'});
  });


  router.get('/alpha-taxonomy/:taxons', function (req, res) {
    var taxonName = req.params.taxons;
    console.log("Taxon page for: %s", taxonName);
    var taxon = Taxon.fromMetadata("/alpha-taxonomy/" + taxonName);
    console.log(taxon);
    res.render('taxonomy', {taxon: taxon, homepage_url: '/'});
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

    globPage.then(function (file){
      var filePath = file[0];
      return filePath;
    }).then(function(filePath) {
      readFile(filePath).then(function(data) {
        content = data.toString();
        var breadcrumb = getBreadcrumb(url);
        var taxons = getTaxons(url);

        console.log("Breadcrumb", breadcrumb);
        console.log("Taxons", taxons);
        var whitehall = filePath.match(/whitehall/);

        res.render('content', { content: content, breadcrumb: breadcrumb, taxons: taxons, whitehall: whitehall, homepage_url: '/'});
      },
      function (e) {
        res.render('content', {content: 'Page not found', homepage_url: '/'});
      });
    });
  });

  function getMetadata() {
    fs.readFile('app/data/metadata_and_taxons.json', function(err, data){
      if (err){
        console.log('Failed to read metadata and taxons.');
      }
      metadata = JSON.parse(data);
    });
  }

  function getBreadcrumb(page) {
    // Pick the first taxon to generate a breadcrumb from
    var taxonForPage = metadata.taxons_for_content[page];

    if (taxonForPage === undefined) {
      console.error("No metadata found for %s. The path should match a GOV.UK base path.", page)
      return null;
    }

    try {

      var firstTaxon = taxonForPage[0];
      var taxonAncestors = [
        {
          title: metadata.taxon_information[firstTaxon].title,
          basePath: firstTaxon,
        }
      ];
      var taxonParents = metadata.ancestors_of_taxon[firstTaxon];

      while (taxonParents && taxonParents.length > 0) {
        // Pick the first parent to use in the breadcrumb
        var ancestor = taxonParents[0];

        taxonAncestors.push(
          {
            title: ancestor.title,
            basePath: ancestor.base_path,
          }
        );

        taxonParents = ancestor.links.parent;
      }

      var breadcrumb = taxonAncestors.reverse();
      breadcrumb.unshift({title: "Home", basePath: ""});
      return breadcrumb;
    }
    catch (e) {
      console.log("Problem getting breadcrumb data for " + page );
    }
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
    constructor(title, basePath) {
      this.title = title;
      this.basePath = basePath;
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
        return a.publicTimestamp > b.publicTimestamp;
      }).slice(0, maxDocuments);
    }

    atozChildren() {
      return this.children.sort(function(a, b) {
        return a.title > b.title;
      });
    }

    static fromMetadata(basePath) {
      var taxonInformation = metadata.taxon_information[basePath];
      console.log("basepath=%s, taxonInformation=%s", basePath, taxonInformation);
      if (taxonInformation === undefined) {
        console.log("Missing taxon information for %s", basePath);
        return null;
      }

      var taxon = new Taxon(taxonInformation.title, basePath);
      var contentItems = metadata.documents_in_taxon[basePath].results;
      var childTaxons = metadata.children_of_taxon[basePath];

      contentItems.forEach(function(contentItem) {
        taxon.addContent({title: contentItem.title, basePath: contentItem.link, format: contentItem.format, publicTimestamp: new Date(contentItem.public_timestamp)});
      });

      childTaxons.forEach(function(childTaxonBasePath) {
        var childTaxon = Taxon.fromMetadata(childTaxonBasePath);
        if (childTaxon != null) {
          taxon.addChild(childTaxon);
        }
      });

      return taxon;
    }
  }

  module.exports = router;

})();
