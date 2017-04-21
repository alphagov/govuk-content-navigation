var SearchService = require('../services/search_service');

class SearchRoutes {
  static show (req, res) {
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
      })
      .catch(function (error) {
        console.error((new Error(error)).stack);
        process.exit(1);
      });
  }
}

module.exports = SearchRoutes;
