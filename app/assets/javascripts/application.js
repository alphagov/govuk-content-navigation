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

    var truncateBreadcrumbs = function() {
      var maxBreadcrumb = 4;
      var $breadcrumbs = $('.breadcrumbs').find('li');
      if ($breadcrumbs.length > maxBreadcrumb) {
        $breadcrumbs.each(function(i){
          var $this = $(this);
          if (i > 1 && i < $breadcrumbs.length - 2) {
            $this.hide();
          }
        });
        var x = $breadcrumbs.eq(1).after('<li><a href="" class="js-toggle-breadcrumb" title="Show breadcrumbs">…</a></li>');
        console.log(x);
      }
    }

    truncateBreadcrumbs();

    $('.js-toggle-breadcrumb').on('click', function(e){
      e.preventDefault();

      $(this).parent().hide().siblings(':hidden').show();
    });



  });
})(window);
