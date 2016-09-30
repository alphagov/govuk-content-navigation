/*
  Object to describe the structure of a taxon
  (its child taxons and the documents tagged to it)
*/
(function() {
  "use strict";

  class Taxon {
    constructor(title, basePath, description) {
      this.title = title;
      this.basePath = basePath;
      this.description = description;
      this.content = [];
      this.children = [];
    }

    isOrganisation(basePath) {
      return basePath.includes("/organisations/");
    }

    addContent(content) {
      /*
      Currently we're tagging organisation home pages and about pages
      ("corporate information pages") to the taxonomy.

      We're not sure if this is the right thing to do because these pages are
      about the organisation themselves, not about the topic, even though
      the organisation may be relevant to the topic. For now, just ignore these
      tags, and don't mix these pages in with the rest of the content.
      This is a workaround until we change how the content is tagged.
      */
      if (!this.isOrganisation(content.basePath)) {
        this.content.push(content);
      }
    }

    addChild(taxon) {
      this.children.push(taxon);
    }

    popularContent(maxDocuments) {
      return this.content.slice(0, maxDocuments);
    }

    atozContent(maxDocuments) {
      var sorted = this.content.sort(function(a, b) {
        if (a.title > b.title) {
          return 1;
        }

        if (a.title < b.title) {
          return -1;
        }

        return 0;
      });

      if (maxDocuments !== undefined) {
        return sorted.slice(0, maxDocuments);
      } else {
        return sorted;
      }
    }

    recentContent(maxDocuments) {
      return this.content.sort(function(a, b) {
        return b.publicTimestamp.getTime() - a.publicTimestamp.getTime();
      }).slice(0, maxDocuments);
    }

    atozChildren() {
      return this.children.sort(function(a, b) {
        return a.title > b.title;
      });
    }

    static fromMetadata(basePath, metadata) {
      var taxonInformation = metadata.taxon_information[basePath];
      if (taxonInformation === undefined) {
        console.log("Missing taxon information for %s", basePath);
        return null;
      }

      var taxon = new Taxon(taxonInformation.title, basePath, taxonInformation.description);
      var contentItems = metadata.documents_in_taxon[basePath].results;
      var childTaxons = metadata.children_of_taxon[basePath];

      contentItems.forEach(function(contentItem) {
        var publicTimestamp = contentItem.public_timestamp;

        // Manual sections are missing a public timestamp: make one up
        if (publicTimestamp === undefined) {
            console.log("Made up timestamp for %s %s", contentItem.format, contentItem.link);
            publicTimestamp = '2016-01-01T00:00:00+00:00';
        }

        taxon.addContent({title: contentItem.title, basePath: contentItem.link, format: contentItem.format, publicTimestamp: new Date(publicTimestamp)});
      });

      childTaxons.forEach(function(childTaxonBasePath) {
        var childTaxon = Taxon.fromMetadata(childTaxonBasePath, metadata);
        if (childTaxon !== null) {
          taxon.addChild(childTaxon);
        }
      });

      return taxon;
    }
  }

  module.exports = Taxon;

})();
