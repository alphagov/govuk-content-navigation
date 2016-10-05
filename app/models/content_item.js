(function() {
  "use strict";

  class ContentItem {
    constructor(title, basePath, documentType, publicTimestamp) {
      this.title = title;
      this.basePath = basePath;
      this.documentType = documentType;
      this.publicTimestamp = publicTimestamp;
    }

    getHeading() {
      switch (this.documentType) {
        case 'news_article':
        case 'speech':
          return {
            display_name: 'News and events',
            id: 'news-and-events'
          };
          break;
        case 'statutory_guidance':
        case 'answer':
        case 'guidance':
        case 'promotional':
        case 'detailed_guidance':
        case 'manual':
          return {
            display_name: 'Guidance',
            id: 'guidance'
          };
          break;
        case 'corporate_information_page':
        case 'organisation':
        case 'corporate_report':
          return {
            display_name: 'Corporate information',
            id: 'corporate-information'
          };
          break;
        case 'foi_release':
        case 'correspondence':
        case 'policy_paper':
          return {
            display_name: 'Government policy and responses',
            id: 'government-policy-and-responses'
          };
          break;
        case 'national_statistics':
        case 'statistics_announcement':
        case 'transparency':
          return {
            display_name: 'Data and statistics',
            id: 'data-and-statistics'
          };
          break;
        case 'research':
        case 'independent_report':
          return {
            display_name: 'Research and analysis',
            id: 'research-and-analysis'
          };
          break;
        case 'consultation':
          return {
            display_name: 'Consultations and notices',
            id: 'consultations-and-notices'
          };
          break;
        default:
          return null;
      }
    }
  }

  module.exports = ContentItem;

})();
