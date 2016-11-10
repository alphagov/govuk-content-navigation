var express = require('express');
var router = express.Router();
var fs = require('fs');
var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);
var urlHelper = require('url');
var _ = require('lodash');

var BreadcrumbMaker = require('../lib/js/breadcrumb_maker.js');
var Taxon = require('./models/taxon.js');
var DocumentType = require('./models/document_type.js');

  router.get('/', function (req, res) {
    getTaxonomyData().
      then(function (taxonomyData) {
        var documentTypeExamples = DocumentType.getExamples(taxonomyData.document_metadata);
        res.render('index', {
          documentTypeExamples: documentTypeExamples
        });
      });
  });

  router.get('/alpha-taxonomy/:taxon', function (req, res) {
    var taxonName = req.params.taxon;
    var taxonBasePath = "/alpha-taxonomy/" + taxonName;
    var viewAllParam = req.query.viewAll;

    getTaxonomyData().
      then(function (taxonomyData) {
        var breadcrumbMaker = new BreadcrumbMaker(taxonomyData);
        var breadcrumb = breadcrumbMaker.getBreadcrumbForTaxon([taxonBasePath]);

        var taxon = Taxon.fromMetadata(taxonBasePath, taxonomyData);
        var taxonContent = {};
        taxonContent.guidance = taxon.filterByHeading('guidance');

        var childTaxons = taxon.atozChildren();
        var grandchild = _.find(childTaxons, function (childTaxon) {
          return childTaxon.children.length > 0;
        });
        var parentTaxon = breadcrumb[breadcrumb.length - 1];

        var isPenultimate = grandchild == undefined;
        var viewAll = viewAllParam != undefined;

        if(viewAll) {
          var backTo = null;

          // The 'back to' link behaviour differs depending on whether we are
          // showing a leaf node taxon or a taxon higher up in the taxonomy.
          if (childTaxons.length > 0) {
            backTo = urlHelper.parse(req.url).pathname;
          } else {
            backTo = parentTaxon.basePath;
          }

          res.render('taxonomy/view-all', {
            taxon: taxon,
            childTaxons: childTaxons,
            parentTaxon: parentTaxon,
            breadcrumb: breadcrumb,
            taxonContent: taxonContent,
            backTo: backTo,
          });
        } else if(isPenultimate) {
          res.render('taxonomy/penultimate-taxon', {
            taxon: taxon,
            childTaxons: childTaxons,
            parentTaxon: parentTaxon,
            breadcrumb: breadcrumb,
            taxonContent: taxonContent,
          });
        } else {
          res.render('taxonomy/taxon', {
            taxon: taxon,
            parentTaxon: breadcrumb[breadcrumb.length - 1],
            breadcrumb: breadcrumb,
            taxonContent: taxonContent,
          });
        }
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

  router.get('/parent-topic', function (req, res) {
    res.render('parent-topic');
  });

  router.get('/child-topic', function (req, res) {
    res.render('child-topic');
  });

  router.get('/view-all', function (req, res) {
    res.render('view-all');
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
            var getBreadcrumbPromise = getTaxonomyData().
              then(function (metadata) {
                var breadcrumbMaker = new BreadcrumbMaker(metadata);
                var breadcrumb = breadcrumbMaker.getBreadcrumbForContent(url);

                return breadcrumb;
              });

            var getTaxonPromise = getTaxons(url).
              then(function (taxons){
                return taxons;
              });

            var getRelatedContentPromise = getRelatedContent("/" + url).
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

  function getTaxonomyData () {
    return readFile('app/data/taxonomy_data.json').
      then(function (data) {
        return JSON.parse(data);
      }).
      catch(function (err) {
        console.log('Failed to read metadata and taxons.');
      })
  }

  function getTaxons (url) {
    return getTaxonomyData().
      then(function (metadata) {
        return metadata.taxons_for_content[url].map(function (taxonBasePath) {
          return Taxon.fromMetadata(taxonBasePath, metadata);
        });

      });
  }

  function getRelatedContent (contentBasePath) {
    var readSourceData = readFile('app/data/hardcoded_related_content.json');

    return readSourceData.
      then(function (data) {
        var lookup = JSON.parse(data);

        return lookup[contentBasePath];
      });
  }

  module.exports = router;
