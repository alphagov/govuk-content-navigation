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

  isSubsection () {
    return(
      [
        "/what-different-qualification-levels-mean-overview",
        "/what-different-qualification-levels-mean-list-of-qualification-levels",
        "/what-different-qualification-levels-mean-compare-different-qualification-levels",
      ].includes(this.basePath)
    )
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
