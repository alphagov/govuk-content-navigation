var DocumentTypes = require('../models/document_types.js');

class SiteRoutes {
  static index (req, res) {
    DocumentTypes.guidanceExamples().
      then(function (guidanceExamples) {
        res.render(
          'index',
          {documentTypeExamples: guidanceExamples}
        );
    });
  }

  static home (req, res) {
    res.render('home');
  }
}

module.exports = SiteRoutes;
