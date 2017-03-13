(function (global) {

  var $ = global.jQuery;
  var GOVUK = global.GOVUK || {};

  $(function () {

    GOVUK.modules.start();
    var $section = $('.subsection__header');
    if ($section.length === 1) {
        $section.trigger('click');
    }

    GOVUK.modules.start();
  });

  // Use GOV.UK selection-buttons.js to set selected
  // and focused states for block labels
  var $blockLabels = $(".block-label input[type='radio'], .block-label input[type='checkbox']")
  new GOVUK.SelectionButtons($blockLabels) // eslint-disable-line

  // Where .block-label uses the data-target attribute
  // to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()

})(window);
