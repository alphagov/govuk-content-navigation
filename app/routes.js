var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var DocumentType = require('./models/document_type.js');
var TaxonPresenter = require('./models/taxon_presenter.js');
var TaxonomyData = require('./models/taxonomy_data.js');
var ContentPresenter = require('./models/content_presenter.js');
var GuidanceContent = require('./models/guidance_content.js');

  router.get('/', function (req, res) {
    TaxonomyData.get().
      then(function (taxonomyData) {
        var documentTypeExamples = DocumentType.getExamples(taxonomyData.document_metadata).
          filter(function (documentTypeExample) {
            return GuidanceContent.isGuidanceContent(documentTypeExample.documentType);
          });
        res.render('index', {
          documentTypeExamples: documentTypeExamples
        });
      });
  });

  router.get('/education/:taxon?/email-sign-up-options/', function (req, res){
    var taxonParam = req.params.taxon;
    if(taxonParam === undefined) {
      taxonParam = "/education";
    }
    else {
      taxonParam = "/education/" + taxonParam;
    }

    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
        res.render('emails/email-sign-up-options', {presentedTaxon: presentedTaxon});
    });
  });

    router.get('/education/:taxon?/email-sign-up-single/', function (req, res){
    var emailSelected = req.params.taxon;
    var taxonParam = req.params.taxon;
    if(taxonParam === undefined) {
      taxonParam = "/education";
    }
    else {
      taxonParam = "/education/" + taxonParam;
    }

    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
        res.render('emails/email-sign-up-single', {
          presentedTaxon: presentedTaxon,
          emailSelected: emailSelected
        });
    });
  });

  router.get('/education/:taxon?', function (req, res) {
    var taxonParam = req.params.taxon;

    if(taxonParam === undefined) {
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

  /* Email pages are for prototyping how the new subscriptions will fit into the
   new navigation */

  router.post('/education/:taxon?/preferences', function (req, res) {
    if (req.body["radio-group"] !== undefined){
      var emailSelected = req.body["radio-group"];
    }
    else
    {
      var emailSelected = '/education/' + req.body.emailSelected;
    }
    var taxonParam = req.params.taxon;
    if(taxonParam === undefined) {
      taxonParam = "/education";
    }
    else {
      taxonParam = "/education/" + taxonParam;
    }

    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
        var emailTaxon = new TaxonPresenter(emailSelected, taxonomyData);
        res.render('emails/email-sign-up-preferences',
          {
            emailSelected: emailSelected,
            presentedTaxon: presentedTaxon,
            emailTaxon: emailTaxon
          });
      });
  });

  router.post('/gov-delivery/email-signup', function (req, res) {
    var emailSelected = req.body.emailSelected;
    res.render('emails/gov-delivery/email-signup', {emailSelected: emailSelected});
  });

  router.post('/emails/gov-delivery/subscriber', function (req, res) {
    var email = req.body.email;
    var taxonParam = req.body.emailSelected;
    TaxonomyData.get().
      then(function (taxonomyData) {
        var presentedTaxon = new TaxonPresenter(taxonParam, taxonomyData);
        res.render('emails/gov-delivery/subscriber',
          {
            email: email,
            taxon: presentedTaxon
          });
      });
   });

  router.get('/email-sign-up-page-v1/', function (req, res) {
    res.render('emails/email-sign-up-page-v1');
  });

  router.get('/gov-delivery-enter/', function (req, res) {
    res.render('emails/gov-delivery-enter');
  });

  router.get('/gov-delivery/subscriber', function (req, res) {
    res.render('emails/gov-delivery/subscriber');
  });

  router.get('/gov-delivery/preferences', function (req, res) {
    res.render('emails/gov-delivery/preferences');
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
    var basePath = req.url;
    const contentPresenter = new ContentPresenter(basePath);

    contentPresenter.present().
      then(function (presentedContent) {
        res.render('content', {
          presentedContent: presentedContent,
        });
      }).
      catch(function () {
        res.status(404).render('404');
      });
  });


  module.exports = router;
