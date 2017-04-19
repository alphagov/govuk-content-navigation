"use strict";
var rewire = require('rewire')

describe('examples()', function() {
  var DocumentTypes = rewire('../../../app/models/document_types');
  DocumentTypes.__set__('SearchService', {
    search: function() {
      return Promise.resolve({
        "facets": {
          "content_store_document_type": {
            "options": [
              {
                "value": {
                  "slug": "press_release",
                  "example_info": {
                    "total": 21734,
                    "examples": [
                      {
                        "title": "Updated measures to protect poultry against Avian Flu",
                        "link": "/government/news/updated-measures-to-protect-poultry-against-avian-flu"
                      }
                    ]
                  }
                },
                "documents": 21552
              },
              {
                "value": {
                  "slug": "hmrc_manual_section",
                  "example_info": {
                    "total": 74638,
                    "examples": [
                      {
                        "title": "EIM32712 - Other expenses: flat rate expenses: table of agreed amounts ",
                        "link": "/hmrc-internal-manuals/employment-income-manual/eim32712"
                      }
                    ]
                  }
                },
                "documents": 74638
              },
            ]
          }
        }
      });
    }
  });

  it('returns a list of example document types and base paths', function(done) {
    DocumentTypes.examples()
      .then(function (examples) {
        expect(examples).toEqual([
          {
            documentType: 'hmrc_manual_section',
            basePath: '/hmrc-internal-manuals/employment-income-manual/eim32712'
          },
          {
            documentType: 'press_release',
            basePath: '/government/news/updated-measures-to-protect-poultry-against-avian-flu'
          }
        ]);
      })
      .then(done);
  });
});
