var express = require('express');
var router = express.Router();

var DocumentTypes = require('./models/document_types.js');
var TaxonPresenter = require('./models/taxon_presenter.js');
var ContentPresenter = require('./models/content_presenter.js');
var SearchService = require('./models/search_service');

router.get('/', function (req, res) {
  DocumentTypes.guidanceExamples().
    then(function (guidanceExamples) {
      res.render(
        'index',
        {documentTypeExamples: guidanceExamples}
      );
  });
});

router.get('/home/?', function (req, res) {
  res.render('home');
});

router.get('/search', function (req, res) {
  var scopedSearch = SearchService.scopedSearch(
    req.query.q,
    req.query.scope
  );

  var allGovUkResultCount = SearchService.count(req.query.q);

  Promise.all([scopedSearch, allGovUkResultCount]).
    then(function ([scopedSearchResults, allResults]) {
      res.render('search', {
        queryParams: req.query,
        scopedSearch: scopedSearchResults,
        allGovUkResultsCount: allResults
      });
    });
});

router.get('/:theme/:taxon?', function (req, res) {
  var theme = "/" + req.params.theme;
  var taxonParam = req.params.taxon;

  if(!taxonParam) {
    taxonParam = theme;
  }
  else {
    taxonParam = theme + "/" + taxonParam;
  }

  var taxonPresenter = new TaxonPresenter(taxonParam);
  taxonPresenter.build().then(presentTaxon);

  function presentTaxon (presentedTaxon) {
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
