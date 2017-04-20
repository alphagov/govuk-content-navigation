var ContentPresenter = require('../presenters/content_presenter.js');

class ContentItemRoutes {
  static show (req, res) {
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
  }
}

module.exports = ContentItemRoutes;
