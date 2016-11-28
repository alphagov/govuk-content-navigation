"use strict";

class ContentItem {
  constructor(title, basePath, documentType, publicTimestamp, description) {
    this.title = title;
    this.basePath = basePath;
    this.documentType = documentType;
    this.publicTimestamp = publicTimestamp;
    this.description = description;
  }

  getHeading () {
    switch (this.documentType) {
      case 'statutory_guidance':
      case 'answer':
      case 'guidance':
      case 'detailed_guidance':
      case 'detailed_guide':
      case 'form':
      case 'guide':
      case 'licence':
      case 'local_transaction':
      case 'map':
      case 'notice':
      case 'programme':
      case 'promotional':
      case 'regulation':
      case 'simple_smart_answer':
      case 'smartanswer':
      case 'manual':
      case 'manual_section':
        return {
          display_name: 'Guidance',
          id: 'guidance'
        };
      default:
        return null;
    }
  }
}

module.exports = ContentItem;
