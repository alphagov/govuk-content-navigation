var BreadcrumbMaker = require('../../../lib/js/breadcrumb_maker.js');
var json_data = require('../../../app/data/metadata_and_taxons.json');

describe('#getBreadcrumbForTaxon', function() {
  var maker = new BreadcrumbMaker(json_data);

  it('should return "Home" for a top-level taxon', function() {
    var taxon = "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills";
    expect(maker.getBreadcrumbForTaxon(taxon)).toEqual([
      {
        "basePath": "",
        "title": "Home",
      }
    ]);
  });

  it('should return a full breadcrumb trail for a bottom-level taxon', function() {
    var taxon = "/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2";
    expect(maker.getBreadcrumbForTaxon(taxon)).toEqual([
      {
        "basePath": "",
        "title": "Home",
      },
      {
        "basePath": "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
        "title": "Education, training and skills",
      },
      {
        "basePath": "/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
        "title": "School education (5 to 18 years)",
      },
      {
        "basePath": "/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance",
        "title": "School curriculum, assessment and performance",
      }
    ]);
  });

  it('should return a full breadcrumb trail using the first parent for a multi-parent bottom-level taxon', function() {
    var taxon = "/alpha-taxonomy/phonics";
    expect(maker.getBreadcrumbForTaxon(taxon)).toEqual([
      {
        "basePath": "",
        "title": "Home",
      },
      {
        "basePath": "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
        "title": "Education, training and skills",
      },
      {
        "basePath": "/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5",
        "title": "Early years curriculum (0 to 5 years)",
      }
    ]);
  });
});
