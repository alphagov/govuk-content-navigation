var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var expressNunjucks = require('express-nunjucks');
var Promise = require("bluebird");
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);

(function(){
  "use strict";

  var metadata = getMetadata();

  router.get('/', function (req, res) {
    res.render('index');
  });


  router.get('/alpha-taxonomy/:taxons', function (req, res) {
    var taxon = req.url.substring(0, req.url.length-1);
    try {
      var taxons = Taxon.fromMetadata(taxon);
      res.render('taxonomy', {taxon: taxons});
    }
    catch (e) {
      res.render('taxonomy');
    }
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
        var whitehall = filePath.match(/whitehall/);

        res.render('content', { content: content, breadcrumb: breadcrumb, taxons: taxons, whitehall: whitehall});
      },
      function (e) {
        res.render('content', {content: 'Page not found'});
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

      return taxonAncestors.reverse();
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
    }

    addContent(content) {
      this.content.push(content);
    }

    popularContent(maxDocuments) {
      return this.content.slice(0, maxDocuments);
    }

    atozContent(maxDocuments) {
      return this.content.sort(function(a, b) {a.title > b.title}).slice(0, maxDocuments);
    }

    recentContent(maxDocuments) {
      return this.content.sort(function(a, b) {a.publicTimestamp > b.publicTimestamp}).slice(0, maxDocuments);
    }

    static fromMetadata(basePath) {
      var taxonInformation = metadata.taxon_information[basePath];
      var taxon = new Taxon(taxonInformation.title, basePath);
      var contentItems = metadata.documents_in_taxon[basePath].results;

      contentItems.forEach(function(contentItem) {
        taxon.addContent({title: contentItem.title, basePath: contentItem.link, format: contentItem.format, publicTimestamp: new Date(contentItem.public_timestamp)});
      });

      return taxon;
    }
  }

  module.exports = router;

})();
