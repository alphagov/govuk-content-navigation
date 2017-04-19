"use strict";
var https = require('./https');

class DocumentTypes {
  static examples() {
    return https.get({
      host: 'www.gov.uk',
      path: '/api/search.json?facet_content_store_document_type=500,examples:1,example_scope:global&count=0'
    })
      .then(function (response) {
        return response.facets.content_store_document_type.options
          .map(function (option) {
            return {
              documentType: option.value.slug,
              basePath: option.value.example_info.examples[0].link
            };
          })
          .sort(function (a, b) {
            return a.documentType.localeCompare(b.documentType);
          });
      });
  }
}

module.exports = DocumentTypes;
