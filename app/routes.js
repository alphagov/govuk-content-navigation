var express = require('express');
var router = express.Router();

var SearchRoutes = require('./routes/search');
var TaxonRoutes = require('./routes/taxons');

var DocumentTypes = require('./models/document_types.js');
var ContentPresenter = require('./models/content_presenter.js');

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

router.get('/search', SearchRoutes.show);
router.get('/:theme/:taxon?', TaxonRoutes.show);

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
