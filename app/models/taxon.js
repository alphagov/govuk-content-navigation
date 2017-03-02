"use strict";

var ContentItem = require("./content_item.js");

class Taxon {
  constructor(title, basePath, contentId, description, options) {
    this.title = title;
    this.basePath = basePath;
    this.contentId = contentId;
    this.description = description;
    if (typeof(options) === "undefined") {
      options = {};
    }
    this.content = options.content || [];
    this.children = options.children || [];
  }

  filterByHeading (headingId) {
    var filteredContent = this.content.filter(
      function (child) {
        var heading = child.getHeading();

        return heading !== null && heading.id === headingId;
      }
    );
    var filteredTaxon = new Taxon(
      this.title, this.basePath, this.contentId, this.description,
      {
        content: filteredContent,
        children: this.children
      }
    );

    return filteredTaxon;
  }

  addContent (content) {
    this.content.push(content);
  }

  addChild (taxon) {
    this.children.push(taxon);
  }

  popularContent (maxDocuments) {
    return this.content.slice(0, maxDocuments);
  }

  atozContent (maxDocuments) {
    var sorted = this.content.sort(function (a, b) {
      if (a.title > b.title) {
        return 1;
      }

      if (a.title < b.title) {
        return -1;
      }

      return 0;
    });

    if (typeof(maxDocuments) !== "undefined") {
      return sorted.slice(0, maxDocuments);
    }

    return sorted;
  }

  recentContent (maxDocuments) {
    return this.content.sort(function (a, b) {
      return b.publicTimestamp.getTime() - a.publicTimestamp.getTime();
    }).slice(0, maxDocuments);
  }

  atozChildren () {
    return this.children.sort(function (a, b) {
      if (a.title >= b.title) {
        return 1;
      }

      return -1;
    });
  }

  static fromMetadata (basePath, metadata) {
    var taxonInformation = metadata.taxon_information[basePath];
    if (typeof(taxonInformation) === "undefined") {
      console.log("Missing taxon information for %s", basePath);

      return null;
    }

    var taxon = new Taxon(taxonInformation.title, basePath, taxonInformation.content_id, taxonInformation.description);
    var contentItems = metadata.documents_in_taxon[basePath].results;
    var childTaxons = metadata.children_of_taxon[basePath];

    contentItems.forEach(function (contentItem) {
      var documentType = metadata.document_metadata[contentItem.link.substring(1)].document_type;
      var publicTimestamp = contentItem.public_timestamp;

      // Manual sections are missing a public timestamp: make one up
      if (typeof(publicTimestamp) === "undefined") {
          publicTimestamp = '2016-01-01T00:00:00+00:00';
      }

      var contentItemModel = new ContentItem(
        contentItem.title,
        contentItem.link,
        documentType,
        new Date(publicTimestamp),
        contentItem.description,
        contentItem.document_collections
      );

      if (contentItemModel.isSubsection() == false &&
          contentItemModel.belongsToDocumentCollection() == false) {
        taxon.addContent(contentItemModel);
      }
    });

    childTaxons.forEach(function (childTaxonBasePath) {
      var childTaxon = Taxon.fromMetadata(childTaxonBasePath, metadata);
      if (childTaxon !== null) {
        taxon.addChild(childTaxon);
      }
    });

    return taxon;
  }
}

module.exports = Taxon;
