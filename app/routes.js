var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var expressNunjucks = require('express-nunjucks');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);
var cheerio = require('cheerio');
var moment = require('moment');
var BreadcrumbMaker = require('../lib/js/breadcrumb_maker.js');
var Taxon = require('./models/taxon.js');

(function() {
  "use strict";

  var metadata;
  var breadcrumbMaker;
  getMetadata().then(function(metadataResult) {
    metadata = metadataResult;
    breadcrumbMaker = new BreadcrumbMaker(metadata);
  });

  router.get('/', function (req, res) {
    res.render('index');
  });

  router.get('/alpha-taxonomy/:taxons', function (req, res) {
    var taxonName = req.params.taxons;
    var url = "/alpha-taxonomy/" + taxonName;
    var taxon = Taxon.fromMetadata(url, metadata);
    var breadcrumb = breadcrumbMaker.getBreadcrumbForTaxon([url]);

    var taxon_content = {};

    taxon_content.guidance = taxon.filterByHeading('guidance');
    taxon_content.research_and_analysis = taxon.filterByHeading('research-and-analysis');

    console.log("Taxon page for: %s", taxonName);
    res.render('taxonomy', {
      taxon: taxon,
      breadcrumb: breadcrumb,
      taxon_content: taxon_content
    });
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
        var $ = cheerio.load(content);
        var whitehall = filePath.match(/whitehall/);
        var html_manual = filePath.match(/manual/);
        var html_publication = content.match(/html-publications-show/);
        var public_timestamp = metadata.document_metadata[url].public_updated_at;
        var breadcrumb;
        var taxons;

        $('h1').first().after('<p class="hack-datestamp">Last updated: ' + moment(public_timestamp).fromNow() + '</p>');

        if (!html_publication) {
          // Skip breadcrumbs and taxons for HTML publications since they have a unique format
          breadcrumb = breadcrumbMaker.getBreadcrumbForContent(url);
          taxons = getTaxons(url);
        }

        var data = {
          content: $.html(),
          publicTimestamp: public_timestamp,
          breadcrumb: breadcrumb,
          taxons: taxons,
          whitehall: whitehall,
          html_manual: html_manual
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
    try {
      return metadata.taxons_for_content[url].map(function(taxonBasePath) {
        return Taxon.fromMetadata(taxonBasePath, metadata);
      });
    } catch(e) {
      console.log("Problem getting taxons for sidebar");
    }
  }

  module.exports = router;

})();
