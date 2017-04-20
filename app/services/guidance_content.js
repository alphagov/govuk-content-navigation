"use strict";

class GuidanceContent {
  static guidanceDocumentTypes () {
    return [
      'answer',
      'contact',
      'detailed_guidance',
      'detailed_guide',
      'document_collection',
      'form',
      'guidance',
      'guide',
      'licence',
      'local_transaction',
      'manual',
      'manual_section',
      'map',
      'place',
      'programme',
      'promotional',
      'regulation',
      'simple_smart_answer',
      'smartanswer',
      'statutory_guidance',
      'transaction',
      'travel-advice'
    ];
  }

  static isGuidanceContent (documentType) {
    return (this.guidanceDocumentTypes().indexOf(documentType) >= 0);
  }
}

module.exports = GuidanceContent;
