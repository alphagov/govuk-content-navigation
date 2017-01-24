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

    $('.js-toggle-breadcrumb').on('click', function(e){
      e.preventDefault();

      $(this).parent().hide().siblings('.js-hidden').removeClass('js-hidden');
    })

  });
})(window);
