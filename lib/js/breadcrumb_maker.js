(function() {
  "use strict";

  class BreadcrumbMaker {
    constructor(metadata) {
      this.metadata = metadata;
    }

    getBreadcrumbForContent(page) {
      // Pick the first taxon to generate a breadcrumb from
      var taxonForPage = this.metadata.taxons_for_content[page];
      if (taxonForPage === undefined) {
        console.error("No metadata found for %s. The path should match a GOV.UK base path.", page);
        return null;
      }
      var firstTaxon = taxonForPage[0];
      return this.getBreadcrumbForParent(firstTaxon);
    }

    getBreadcrumbForTaxon(taxon) {
      var taxonParent = this.metadata.ancestors_of_taxon[taxon];

      if (taxonParent === null || taxonParent === []) {
        return [{title: "Home", basePath: ""}];
      } else {
        return this.getBreadcrumbForParent(taxonParent[0].base_path);
      }
    }

    getBreadcrumbForParent(firstTaxon) {
      try {
        var taxonAncestors = [
          {
            title: this.metadata.taxon_information[firstTaxon].title,
            basePath: firstTaxon,
          }
        ];
        var taxonParents = this.metadata.ancestors_of_taxon[firstTaxon];

        while (taxonParents && taxonParents.length > 0) {
          // Pick the first parent to use in the breadcrumb
          var ancestor = taxonParents[0];

          taxonAncestors.push(
            {
              title: ancestor.title,
              basePath: ancestor.base_path,
            }
          );

          taxonParents = ancestor.links.parent_taxons;
        }

        var breadcrumb = taxonAncestors.reverse();
        breadcrumb.unshift({title: "Home", basePath: ""});
        return breadcrumb;
      }
      catch (e) {
        console.log("Problem getting breadcrumb data for " + firstTaxon);
      }
    }
  }

  module.exports = BreadcrumbMaker;

})();
