var TaxonPresenter = require('../presenters/taxon_presenter.js');

class TaxonRoutes {
  static show(req, res, next) {
    if (!TaxonPresenter.isValidTheme(req.params.theme)) {
      return next();
    }

    var theme = "/" + req.params.theme;
    var taxonParam = req.params.taxon;

    if (!taxonParam) {
      taxonParam = theme;
    }
    else {
      taxonParam = theme + "/" + taxonParam;
    }

    TaxonPresenter.build(taxonParam).then(presentTaxon);

    function presentTaxon(taxon) {
      if (taxon.hasGrandchildren) {
        res.render('taxonomy/grid', {
          taxon: taxon,
        });
      } else {
        res.render('taxonomy/accordion', {
          taxon: taxon,
        });
      }
    }
  }
}

module.exports = TaxonRoutes;
