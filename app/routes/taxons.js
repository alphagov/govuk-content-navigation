var TaxonPresenter = require('../models/taxon_presenter.js');

class TaxonRoutes {
  static show (req, res, next) {
    if(!TaxonPresenter.isValidTheme(req.params.theme)) {
      return next();
    }

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
  }
}

module.exports = TaxonRoutes;
