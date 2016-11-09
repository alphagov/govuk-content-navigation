var _ = require('lodash');

(function() {
  "use strict";

  var DocumentType = {
    getExamples: function (documentMetadata) {
      var collectedExamples = {};

      _.each(documentMetadata, function (metadata, basePath) {
        if(!collectedExamples[metadata.document_type]) {
          collectedExamples[metadata.document_type] = basePath;
        }
      });

      collectedExamples = _.map(collectedExamples, function (basePath, documentType) {
        return {
          documentType: documentType,
          basePath: basePath
        };
      });

      collectedExamples = _.sortBy(collectedExamples, "documentType");
    }
  }

  module.exports = DocumentType;
})();
