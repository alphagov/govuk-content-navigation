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
})(window);
