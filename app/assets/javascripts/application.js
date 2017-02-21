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

  $(function() {
    $('.related-topic-links').each(function(i) {
      if (i > 0) {
        var $this = $(this);
        var title = $this.find('h2').text();
        $this.find('ul').hide();
        $this.find('.reveal').text('See related links in '+title).on('click', function(e) {
          e.preventDefault();
          $this.find('ul').show();
          $(this).text('See everything in '+title).on('click', function(e) {
            window.location = this.href;
          });
        })
      }
    })
  })
})(window);
