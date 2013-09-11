(function ($) {
  $(function() {
    var counter = 0;
    var fortune = $('#fortune');
    var container = $('#container');

    window.fortuneShowing = false;

    function hideFortune() {
      fortune.fadeOut(2000, function () {
        container.fadeIn(2000, function() {
          window.fortuneShowing = false;
        });
      });
    }

    $.ajax({
      url: '/fortunes',
      dataType: 'json'
    }).then(function (data) {
      var fortunes = data.fortunes;
      $('body').on('fortune', function (ev, num) {
        if(!window.fortuneShowing) {
          window.fortuneShowing = true;
          num = num || (++counter % fortunes.length);
          container.fadeOut(2000, function () {
            fortune.html(fortunes[num]).fadeIn(2000, function () {
              setTimeout(hideFortune, 5000);
            }).css('margin-top', -(fortune.height() / 2));
          });
        }
      });
    });
  });
})(jQuery);
