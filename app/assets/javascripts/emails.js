 (function($, root) {
 $("a[data-toggle='tab']").click(function (event){
    if ($(this).attr("href") == "#tab2") {
      console.log($(".nav-tabs :nth-child(1)"));
      $(".nav-tabs :nth-child(1)").removeClass("active");
      $(".nav-tabs :nth-child(2)").addClass("active");
      $(".tab-content :nth-child(1)").removeClass("active");
      $(".tab-content :nth-child(2)").addClass("active");
    }
    else
    {
      $(".nav-tabs :nth-child(2)").removeClass("active");
      $(".nav-tabs :nth-child(1)").addClass("active");
      $(".tab-content :nth-child(2)").removeClass("active");
      $(".tab-content :nth-child(1)").addClass("active");
    }
 });
})(jQuery, window);
