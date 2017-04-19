"use strict";
var https = require('../../app/models/https');

class Breadcrumbs {
  static forBasePath(basePath) {
    return https.get({
      host: 'www.gov.uk',
      path: '/api/content' + basePath
    })
      .then(function (contentItem) {
        return Breadcrumbs.forContentItem(contentItem);
      });
  }

  static forContentItem(contentItem) {
    var breadcrumbs = [{
      title: contentItem.title,
      basePath: contentItem.base_path
    }];

    var links = contentItem.links || {};
    var parents = links.parent_taxons || links.taxons || [];

    var parentBreadcrumbs = parents.length
      // Just use the first parent
      ? Breadcrumbs.forContentItem(parents[0])
      : [{title: "Home", basePath: "/home"}];

    return parentBreadcrumbs.concat(breadcrumbs);
  }
}

module.exports = Breadcrumbs;
