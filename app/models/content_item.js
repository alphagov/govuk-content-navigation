(function() {
  "use strict";

  class ContentItem {
    constructor(title, basePath, format, publicTimestamp) {
      this.title = title;
      this.basePath = basePath;
      this.format = format;
      this.publicTimestamp = publicTimestamp;
    }

    getHeading() {
      switch (this.format) {
        case 'news_article':
        case 'speech':
          return {
            display_name: 'News and events',
            id: 'news-and-events'
          };
          break;
        case 'answer':
        case 'detailed_guidance':
        case 'manual':
          return {
            display_name: 'Other guidance',
            id: 'other-guidance'
          };
          break;
        case 'corporate_information_page':
        case 'organisation':
          return {
            display_name: 'Corporate information',
            id: 'corporate-information'
          };
          break;
        case 'statistics_announcement':
          return {
            display_name: 'Data and statistics',
            id: 'data-and-statistics'
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
