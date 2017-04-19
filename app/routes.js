var express = require('express');
var router = express.Router();

var SearchRoutes = require('./routes/search');
var TaxonRoutes = require('./routes/taxons');
var ContentItemRoutes = require('./routes/content_items');
var SiteRoutes = require('./routes/site');

router.get('/', SiteRoutes.index);
router.get('/home/?', SiteRoutes.home);
router.get('/search', SearchRoutes.show);
router.get('/:theme/:taxon?', TaxonRoutes.show);
router.get(/\/.+/, ContentItemRoutes.show);

module.exports = router;
