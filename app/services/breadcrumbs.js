"use strict";

var https = require('../../app/models/https');

class Breadcrumbs {
  static fromBasePath(basePath) {
    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + basePath
    })
      .then(function (contentItem) {
        return Breadcrumbs.fromContentItem(contentItem);
      });
  }

  static fromContentItem(contentItem) {
    var breadcrumbs = [{
      title: contentItem.title,
      basePath: contentItem.base_path
    }];

    var links = contentItem.links || {};
    var parents = links.parent_taxons || links.taxons || [];

    var parentBreadcrumbs = parents.length
      // Just use the first parent - at some point we'll want to be "smarter" about this
      ? Breadcrumbs.fromContentItem(parents[0])
      : [{title: "Home", basePath: "/home"}];

    return parentBreadcrumbs.concat(breadcrumbs);
  }
}

module.exports = Breadcrumbs;
