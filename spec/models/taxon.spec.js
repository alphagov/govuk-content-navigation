"use strict";

var rewire = require('rewire');

describe('Taxon', function() {
  var Taxon = rewire('../../app/models/taxon');

  it('fetches from the content store', function(done) {
    Taxon.__set__('ContentStore', {
      contentItem: function(basePath) {
        return Promise.resolve({
          base_path: basePath,
          title: 'A taxon',
          description: 'A description of some taxon'
        });
      }
    });

    Taxon.fromBasePath('/education')
      .withContentItem()
      .asPromise()
      .then(function (taxon) {
        expect(taxon.contentItem).toEqual({
          base_path: '/education',
          title: 'A taxon',
          description: 'A description of some taxon'
        })
      })
      .then(done);
  });

  it('only calls the content store once, even if requested multiple times', function(done) {
    var ContentStore = {
      contentItem: function(basePath) {
        return Promise.resolve({
          base_path: basePath,
          title: 'A taxon',
          description: 'A description of some taxon'
        });
      }
    };

    Taxon.__set__('ContentStore', ContentStore);
    spyOn(ContentStore, 'contentItem').and.callThrough();

    Taxon.fromBasePath('/education')
      .withContentItem()
      .withContentItem()
      .asPromise()
      .then(function () {
        expect(ContentStore.contentItem.calls.count()).toBe(1);
      })
      .then(done);
  });

  it('fetches children', function(done) {
    Taxon.__set__('ContentStore', {
      contentItem: function(basePath) {
        return Promise.resolve({
          base_path: basePath,
          links: {
            child_taxons: [
              {
                base_path: '/child-1',
                title: 'Child 1'
              },
              {
                base_path: '/child-2',
                title: 'Child 2'
              }
            ]
          }
        });
      }
    });

    Taxon.fromBasePath('/education')
      .withChildren()
      .asPromise()
      .then(function (taxon) {
        expect(taxon.children).toEqual([
          Taxon.fromBasePath('/child-1'),
          Taxon.fromBasePath('/child-2')
        ])
      })
      .then(done);
  });

  it('can fetch children and their content items', function(done) {
    Taxon.__set__('ContentStore', {
      contentItem: function(basePath) {
        return Promise.resolve({
          base_path: basePath,
          links: {
            child_taxons: [
              {
                base_path: '/child-1',
                title: 'Child 1'
              },
              {
                base_path: '/child-2',
                title: 'Child 2'
              }
            ]
          }
        });
      }
    });

    Taxon.fromBasePath('/education')
      .eachChild(function (child) {
        return child.withContentItem().asPromise();
      })
      .asPromise()
      .then(function (taxon) {
        expect(taxon.children[0].contentItem).toEqual({
          base_path: '/child-1',
          links: {
            child_taxons: [
              {
                base_path: '/child-1',
                title: 'Child 1'
              },
              {
                base_path: '/child-2',
                title: 'Child 2'
              }
            ]
          }
        })
      })
      .then(done);
  });

  it('fetches tagged content', function(done) {
    Taxon.__set__('SearchService', {
      search: function() {
        return Promise.resolve({
          results: [
            {
              base_path: '/result-1'
            },
            {
              base_path: '/result-2'
            }
          ]
        });
      }
    });

    Taxon.fromBasePath('/education')
      .withTaggedContent()
      .asPromise()
      .then(function (taxon) {
        expect(taxon.taggedContent).toEqual([
          {
            base_path: '/result-1'
          },
          {
            base_path: '/result-2'
          }
        ])
      })
      .then(done);
  });
});
