"use strict";
var SearchService = require('./search_service');

class DocumentTypes {
  static examples() {
    return SearchService.search({
      facet_content_store_document_type: '500,examples:1,example_scope:global',
      count: 0
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
