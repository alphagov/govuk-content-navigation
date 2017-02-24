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

  router.get('/education/:taxon?/email-sign-up-generic/', function (req, res){
    var taxonParam = req.params.taxon;
    console.log('taxon', taxonParam)
    if(taxonParam === undefined) {
      taxonParam = "/education";
    }
    else {
      taxonParam = "/education/" + taxonParam;
    }

    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
        console.log('title', presentedTaxon.title);
        console.log('description', presentedTaxon.description);
        res.render('emails/email-sign-up-generic', {presentedTaxon: presentedTaxon});
    });
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

    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
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

  router.get('/email-sign-up-page-v1/', function (req, res) {
      res.render('emails/email-sign-up-page-v1');
  });

    router.get('/gov-delivery-enter/', function (req, res) {
      res.render('emails/gov-delivery-enter');
  });

    router.get('/email-sign-up-page-wellbeing/', function (req, res) {
      res.render('emails/email-sign-up-page-wellbeing');
  });

    router.get('/email-sign-up-page-SEND/', function (req, res) {
      res.render('emails/email-sign-up-page-SEND');
  });

    router.get('/email-sign-up-page-running/', function (req, res) {
      res.render('emails/email-sign-up-page-running');
  });

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
