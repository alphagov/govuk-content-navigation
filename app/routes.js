var express = require('express');
var router = express.Router();

var SearchRoutes = require('./routes/search');
var TaxonRoutes = require('./routes/taxons');
var ContentItemRoutes = require('./routes/content_items');

var DocumentTypes = require('./models/document_types.js');

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
router.get(/\/.+/, ContentItemRoutes.show);

module.exports = router;
