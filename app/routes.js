var express = require('express');
var router = express.Router();
var fs = require('fs');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);

var BreadcrumbMaker = require('../lib/js/breadcrumb_maker.js');
var Taxon = require('./models/taxon.js');
var DocumentType = require('./models/document_type.js');
var TaxonPresenter = require('./models/taxon_presenter.js');
var TaxonomyData = require('./models/taxonomy_data.js');
var RelatedContent = require('./models/related_content.js');

  router.get('/', function (req, res) {
    TaxonomyData.get().
      then(function (taxonomyData) {
        var documentTypeExamples = DocumentType.getExamples(taxonomyData.document_metadata);
        res.render('index', {
          documentTypeExamples: documentTypeExamples
        });
      });
  });

  router.get('/alpha-taxonomy/:taxon', function (req, res) {
    var taxonParam = req.params.taxon;
    var viewAll = !(typeof(req.query.viewAll) === "undefined");

    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
        var breadcrumb = presentedTaxon.breadcrumb;

        if(viewAll) {
          var backTo = presentedTaxon.determineBackToLink(req.url);
          res.render('taxonomy/view-all', {
            presentedTaxon: presentedTaxon,
            breadcrumb: presentedTaxon.breadcrumb,
            backTo: backTo,
          });

          return;
        } else if(presentedTaxon.isPenultimate) {
          res.render('taxonomy/penultimate-taxon', {
            presentedTaxon: presentedTaxon,
            breadcrumb: breadcrumb,
          });

          return;
        }

        res.render('taxonomy/taxon', {
          presentedTaxon: presentedTaxon,
          breadcrumb: breadcrumb,
        });
      });
  });

  /* The two routes below, 'static-service' and 'become-childminder' are rough
   examples of services.  Services are currenly outside of the scope of the
   prototype but may be looked at in the future.*/
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
            var getBreadcrumbPromise = TaxonomyData.get().
              then(function (metadata) {
                var breadcrumbMaker = new BreadcrumbMaker(metadata);
                var breadcrumb = breadcrumbMaker.getBreadcrumbForContent(url);

                return breadcrumb;
              });

            var getTaxonPromise = getTaxons(url).
              then(function (taxons){
                return taxons;
              });

            var getRelatedContentPromise = RelatedContent.get("/" + url).
              then(function (relatedContent) {
                return relatedContent;
              });

            Promise.all([getBreadcrumbPromise, getTaxonPromise, getRelatedContentPromise]).
              spread(function (breadcrumbResult, taxonResult, relatedContentResult){
                var breadcrumb = breadcrumbResult;
                var taxons = taxonResult;
                var relatedContent = relatedContentResult;
                res.render('content', {
                  content: content,
                  breadcrumb: breadcrumb,
                  taxons: taxons,
                  whitehall: whitehall,
                  htmlManual: htmlManual,
                  relatedContent: relatedContent,
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

  function getTaxons (url) {
    return TaxonomyData.get().
      then(function (metadata) {
        return metadata.taxons_for_content[url].map(function (taxonBasePath) {
          return Taxon.fromMetadata(taxonBasePath, metadata);
        });

      });
  }

  module.exports = router;
