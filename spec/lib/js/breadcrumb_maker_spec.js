var BreadcrumbMaker = require('../../../lib/js/breadcrumb_maker.js');
var json_data = require('../../../app/data/taxonomy_data.json');

describe('#getBreadcrumbForTaxon', function() {
  var maker = new BreadcrumbMaker(json_data);

  it('should return "Home" for a top-level taxon', function() {
    var taxon = "/education";
    expect(maker.getBreadcrumbForTaxon(taxon)).toEqual([
      {
        "basePath": "https://www.gov.uk",
        "title": "Home",
      }
    ]);
  });

  it('should return a full breadcrumb trail for a bottom-level taxon', function() {
    var taxon = "/education/apprenticeships-traineeships-and-internships";
    expect(maker.getBreadcrumbForTaxon(taxon)).toEqual([
      {
        "basePath": "https://www.gov.uk",
        "title": "Home",
      },
      {
        "basePath": "/education",
        "title": "Education, training and skills",
      },
      {
        "title": 'Further and higher education, skills and vocational training',
        "basePath": '/education/further-and-higher-education-skills-and-vocational-training'
      }
    ]);
  });

  it('should return a full breadcrumb trail using the first parent for a multi-parent bottom-level taxon', function() {
    var taxon = "/education/phonics";
    var breadcrumb = maker.getBreadcrumbForTaxon(taxon);
    expect(breadcrumb.length).toBeGreaterThan(1);
    expect(breadcrumb[0]).toEqual(
      {
        "basePath": "https://www.gov.uk",
        "title": "Home",
      }
    );
  });
});
