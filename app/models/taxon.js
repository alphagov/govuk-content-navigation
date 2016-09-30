var ContentItem = require("./content_item.js");

/*
  Object to describe the structure of a taxon
  (its child taxons and the documents tagged to it)
*/
(function() {
  "use strict";

  class Taxon {
    constructor(title, basePath, description, options) {
      this.title = title;
      this.basePath = basePath;
      this.description = description;
      if (options === undefined) {
        options = {};
      }
      if (options.content === undefined) {
        options.content = [];
      }
      if (options.children === undefined) {
        options.children = [];
      }
      this.content = options.content;
      this.children = options.children;
    }

    filterByHeading(headingId) {
      var filteredContent = this.content.filter(
        function(child) {
          var heading = child.getHeading();
          return heading !== null && heading.id === headingId;
        }
      );
      var filteredTaxon = new Taxon(
        this.title, this.basePath, this.description,
        {content: filteredContent, children: this.children}
      );
      return filteredTaxon;
    }

    addContent(content) {
      this.content.push(content);
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
        var documentType = metadata.document_metadata[contentItem.link.substring(1)].document_type;
        var publicTimestamp = contentItem.public_timestamp;

        // Manual sections are missing a public timestamp: make one up
        if (publicTimestamp === undefined) {
            console.log("Made up timestamp for %s %s", contentItem.format, contentItem.link);
            publicTimestamp = '2016-01-01T00:00:00+00:00';
        }

        var contentItemModel = new ContentItem(contentItem.title, contentItem.link, documentType, new Date(publicTimestamp));
        taxon.addContent(contentItemModel);
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
