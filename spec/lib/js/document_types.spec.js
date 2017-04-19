"use strict";
var rewire = require('rewire')

describe('guidanceExamples()', function() {
  var DocumentTypes = rewire('../../../app/models/document_types');
  DocumentTypes.__set__('SearchService', {
    search: function() {
      return Promise.resolve({
        "facets": {
          "content_store_document_type": {
            "options": [
              {
                "value": {
                  "slug": "guidance",
                  "example_info": {
                    "total": 21333,
                    "examples": [
                      {
                        "title": "Rates of vehicle tax (V149 and V149/1)",
                        "link": "/government/publications/rates-of-vehicle-tax-v149"
                      }
                    ]
                  }
                },
                "documents": 19376
              },
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

  it('returns a list of guidance example document types and base paths', function(done) {
    DocumentTypes.guidanceExamples()
      .then(function (guidanceExamples) {
        expect(guidanceExamples).toEqual([
            {
              documentType: 'guidance',
              basePath: "/government/publications/rates-of-vehicle-tax-v149"
            }
        ]);
      })
      .then(done);
  });
});
