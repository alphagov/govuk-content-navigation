"use strict";

var GuidanceContent = require('./guidance_content');

class ContentItem {
  constructor(title, basePath, documentType, publicTimestamp, description) {
    this.title = title;
    this.basePath = basePath;
    this.documentType = documentType;
    this.publicTimestamp = publicTimestamp;
    this.description = description;
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
