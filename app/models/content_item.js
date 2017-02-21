"use strict";

var GuidanceContent = require('./guidance_content');

class ContentItem {
  constructor(title, basePath, documentType, publicTimestamp, description, documentCollections) {
    this.title = title;
    this.basePath = basePath;
    this.documentType = documentType;
    this.publicTimestamp = publicTimestamp;
    this.description = description;
    this.documentCollections = documentCollections;
  }

  belongsToDocumentCollection () {
    return (
      this.documentCollections != undefined && this.documentCollections.length > 0
    )
  }

  getHeading () {
    if (GuidanceContent.isGuidanceContent(this.documentType)) {
      return {
        display_name: 'Guidance',
        id: 'guidance'
      };
    }

    return null;
  }
}

module.exports = ContentItem;
