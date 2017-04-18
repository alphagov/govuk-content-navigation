var rewire = require('rewire');

describe('Breadcrumbs', function() {
  var Breadcrumbs = rewire('../../../lib/js/breadcrumbs.js');

  it('should return "Home" and the taxon for a top-level taxon', function(done) {
    Breadcrumbs.__set__('https', {
      get: function() {
        return Promise.resolve({
          "base_path": "/education",
          "title": "Education, training and skills"
        });
      }
    });

    Breadcrumbs.forBasePath('/education')
      .then(function (breadcrumbs) {
        expect(breadcrumbs).toEqual([
          {
            basePath: "/home",
            title: "Home"
          },
          {
            basePath: '/education',
            title: "Education, training and skills"
          }
        ]);
      })
      .then(done);
  });

  it('should return a full breadcrumb trail for a bottom-level taxon', function(done) {
    Breadcrumbs.__set__('https', {
      get: function() {
        return Promise.resolve({
          "base_path": "/education/apprenticeships-traineeships-and-internships",
          "title": "Apprenticeships, traineeships and internships",
          "links": {
            "parent_taxons": [
              {
                "base_path": "/education/further-and-higher-education-skills-and-vocational-training",
                "title": "Further and higher education, skills and vocational training",
                "links": {
                  "parent_taxons": [
                    {
                      "base_path": "/education",
                      "title": "Education, training and skills"
                    }
                  ]
                }
              }
            ]
          }
        });
      }
    });

    Breadcrumbs.forBasePath('/education')
      .then(function (breadcrumbs) {
        expect(breadcrumbs).toEqual([
          {
            basePath: "/home",
            title: "Home"
          },
          {
            basePath: '/education',
            title: "Education, training and skills"
          },
          {
            basePath: '/education/further-and-higher-education-skills-and-vocational-training',
            title: "Further and higher education, skills and vocational training"
          },
          {
            basePath: '/education/apprenticeships-traineeships-and-internships',
            title: "Apprenticeships, traineeships and internships"
          }
        ]);
      })
      .then(done);
  });

  it('should return a full breadcrumb trail using the first parent for a multi-parent bottom-level taxon', function(done) {
    Breadcrumbs.__set__('https', {
      get: function() {
        return Promise.resolve({
          "base_path": "/child-taxon",
          "title": "Child taxon",
          "links": {
            "parent_taxons": [
              {
                "base_path": "/parent-1",
                "title": "Parent 1"
              },
              {
                "base_path": "/parent-2",
                "title": "Parent 2"
              }
            ]
          }
        });
      }
    });

    Breadcrumbs.forBasePath('/education')
      .then(function (breadcrumbs) {
        expect(breadcrumbs).toEqual([
          {
            basePath: "/home",
            title: "Home"
          },
          {
            basePath: '/parent-1',
            title: "Parent 1"
          },
          {
            basePath: '/child-taxon',
            title: "Child taxon"
          }
        ]);
      })
      .then(done);
  });

  it('should return a full breadcrumb trail for a content item', function(done) {
    Breadcrumbs.__set__('https', {
      get: function() {
        return Promise.resolve({
          "base_path": "/content-item",
          "title": "Content item",
          "links": {
            "taxons": [
              {
                "base_path": "/child-taxon",
                "title": "Child taxon",
                "links": {
                  "parent_taxons": [
                    {
                      "base_path": "/parent-taxon",
                      "title": "Parent taxon"
                    }
                  ]
                }
              }
            ]
          }
        });
      }
    });

    Breadcrumbs.forBasePath('/education')
      .then(function (breadcrumbs) {
        expect(breadcrumbs).toEqual([
          {
            basePath: "/home",
            title: "Home"
          },
          {
            basePath: '/parent-taxon',
            title: "Parent taxon"
          },
          {
            basePath: '/child-taxon',
            title: "Child taxon"
          },
          {
            basePath: "/content-item",
            title: "Content item"
          }
        ]);
      })
      .then(done);
  });
});
