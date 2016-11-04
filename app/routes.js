var express = require('express');
var router = express.Router();
var fs = require('fs');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);
var _ = require('lodash');

var BreadcrumbMaker = require('../lib/js/breadcrumb_maker.js');
var Taxon = require('./models/taxon.js');

  router.get('/', function (req, res) {
    res.render('index');
  });

  router.get('/alpha-taxonomy/:taxons', function (req, res) {
    var taxonName = req.params.taxons;
    var url = "/alpha-taxonomy/" + taxonName;
    getMetadata().
    then(function (metadata){
      var taxon = Taxon.fromMetadata(url, metadata);
      var breadcrumbMaker = new BreadcrumbMaker(metadata);
      var breadcrumb = breadcrumbMaker.getBreadcrumbForTaxon([url]);
      var taxonContent = {};
      taxonContent.guidance = taxon.filterByHeading('guidance');
      taxonContent.research_and_analysis = taxon.filterByHeading('research-and-analysis');
        res.render('taxonomy', {
          taxon: taxon,
          breadcrumb: breadcrumb,
          taxonContent: taxonContent
      });
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

    var directory = __dirname + '/content/';

    var globPage = glob(directory + "/**/" + basename + ".html");

    globPage.
    then(function (file) {
      var filePath = file[0];
      
      return filePath;
    }).
    then(function (filePath) {
      readFile(filePath).
      then(function (data) {
        var content = data.toString();
        var whitehall = filePath.match(/whitehall/);
        var htmlManual = filePath.match(/manual/);
        var htmlPublication = content.match(/html-publications-show/);

        if (!htmlPublication) {
          // Skip breadcrumbs and taxons for HTML publications since they have a unique format
          var getBreadcrumbPromise = getMetadata().then(function (metadata){
            var breadcrumbMaker = new BreadcrumbMaker(metadata);
            var breadcrumb = breadcrumbMaker.getBreadcrumbForContent(url);

            return breadcrumb;
          });

          var getTaxonPromise = getTaxons(url).
          then(function (taxons){
            return taxons;
          });

          Promise.all([getBreadcrumbPromise, getTaxonPromise]).
          spread(function (getBreadcrumbPromise, getTaxonPromise){
            var breadcrumb = getBreadcrumbPromise;
            var taxons = getTaxonPromise;
            res.render('content', {
              content: content,
              breadcrumb: breadcrumb,
              taxons: taxons,
              whitehall: whitehall,
              htmlManual: htmlManual
            });
          }); 
        }
        else {
          res.render('content', {
            content: content,
            whitehall: whitehall
          });
        }
      },
      function (err) {
        res.status(404).render('404');
      });
    });
  });

  function getMetadata () {
    return readFile('app/data/metadata_and_taxons.json').
    catch(function (err){
        console.log('Failed to read metadata and taxons.');
    }).
    then(function (data) {
      return JSON.parse(data);
    });
  }

  function getTaxons (url) {
    return getMetadata().
    then(function (metadata){
      return metadata.taxons_for_content[url].
      map(function (taxonBasePath) {
        return Taxon.fromMetadata(taxonBasePath, metadata);
      });
    });
  }

  module.exports = router;
