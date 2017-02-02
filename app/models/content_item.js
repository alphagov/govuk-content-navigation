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
      case 'answer':
      case 'contact':
      case 'detailed_guidance':
      case 'detailed_guide':
      case 'form':
      case 'guidance':
      case 'guide':
      case 'licence':
      case 'local_transaction':
      case 'manual':
      case 'manual_section':
      case 'map':
      case 'place':
      case 'programme':
      case 'promotional':
      case 'regulation':
      case 'simple_smart_answer':
      case 'smartanswer':
      case 'statutory_guidance':
      case 'transaction':
      case 'travel-advice':
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
