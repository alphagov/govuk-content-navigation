var express = require('express');
var router = express.Router();

var DocumentType = require('./models/document_type.js');
var TaxonPresenter = require('./models/taxon_presenter.js');
var TaxonomyData = require('./models/taxonomy_data.js');
var ContentPresenter = require('./models/content_presenter.js');
var GuidanceContent = require('./models/guidance_content.js');

  router.get('/', function (req, res) {
    TaxonomyData.get().
      then(function (taxonomyData) {
        var documentTypeExamples = DocumentType.getExamples(taxonomyData.document_metadata)
          .filter(function(documentTypeExample) {
            return GuidanceContent.isGuidanceContent(documentTypeExample.documentType);
          });
        res.render('index', {
          documentTypeExamples: documentTypeExamples
        });
      });
  });

  router.get('/parenting-childcare/:taxon?', function (req, res) {
    var taxonParam = req.params.taxon;

    if(taxonParam == undefined) {
      taxonParam = "/parenting-childcare";
    }
    else {
      taxonParam = "/parenting-childcare/" + taxonParam;
    }
    var viewAll = !(typeof(req.query.viewAll) === "undefined");

    var taxonPresenter = new TaxonPresenter(taxonParam);
    taxonPresenter.build().then(presentTaxon);

    function presentTaxon(presentedTaxon) {
      if (viewAll) {
        var backTo = presentedTaxon.determineBackToLink(req.url);
        res.render('taxonomy/view-all', {
          presentedTaxon: presentedTaxon,
          backTo: backTo,
        });

        return;
      }

      if (presentedTaxon.isPenultimate) {
        res.render('taxonomy/penultimate-taxon', {
          presentedTaxon: presentedTaxon,
        });
      } else {
        res.render('taxonomy/taxon', {
          presentedTaxon: presentedTaxon,
        });
      }
    }
  });

  router.get('/education/:taxon?', function (req, res) {
    var taxonParam = req.params.taxon;

    if(taxonParam == undefined) {
      taxonParam = "/education";
    }
    else {
      taxonParam = "/education/" + taxonParam;
    }
    var viewAll = !(typeof(req.query.viewAll) === "undefined");

    var taxonPresenter = new TaxonPresenter(taxonParam);
    taxonPresenter.build().then(presentTaxon);

    function presentTaxon(presentedTaxon) {
      if (viewAll) {
        var backTo = presentedTaxon.determineBackToLink(req.url);
        res.render('taxonomy/view-all', {
          presentedTaxon: presentedTaxon,
          backTo: backTo,
        });

        return;
      }

      if (presentedTaxon.isPenultimate) {
        res.render('taxonomy/penultimate-taxon', {
          presentedTaxon: presentedTaxon,
        });
      } else {
        res.render('taxonomy/taxon', {
          presentedTaxon: presentedTaxon,
        });
      }
    }
  });

  router.get('/home/?', function(req, res) {
    res.render('home');
  })

  router.get(/\/.+/, function (req, res) {
    var basePath = req.url;
    const contentPresenter = new ContentPresenter(basePath)

    contentPresenter.present().
      then(function (presentedContent) {
        res.render('content', {
          presentedContent: presentedContent,
        })
      }).
      catch(function () {
        res.status(404).render('404');
      })
  });

  module.exports = router;
