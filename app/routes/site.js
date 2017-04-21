var DocumentTypes = require('../models/document_types.js');

class SiteRoutes {
  static index (req, res) {
    DocumentTypes.guidanceExamples().
      then(function (guidanceExamples) {
        res.render(
          'index',
          {documentTypeExamples: guidanceExamples}
        );
      })
      .catch(function (error) {
        console.error((new Error(error)).stack);
        process.exit(1);
      });;
  }

  static home (req, res) {
    res.render('home');
  }
}

module.exports = SiteRoutes;
