(function ($) {
  $('#first, #second, #third').fillCanvas({
    folder: 'img/200/',
    images: [ 'beakerhead', 'coin', 'crane', 'fan', 'koi',
      'lantern', 'lightbulb', 'robot', 'rocket', 'kitty'],
    repeat: true
  }, function (images) {
    var socket = io.connect();
    var positions = [];
    var current = 0;
    var selections = [0, 0, 0];
    var mappings = {
      0: '#first'
    }
    var setValue = function (id, value) {
      var id = mappings[id];

      selections[id] = value;
      $(id).rotateTo(positions[value]);
    }

    images.forEach(function (image) {
      positions.push(current);
      current += image.height;
    });

    socket.on('value', setValue);

    socket.on('active', function (id) {
      $(mappings[id]).addClass('active');
    });

    socket.on('inactive', function (id) {
      $(mappings[id]).removeClass('active');
      // $('body').trigger('fortune', 0);
    });

    $('[name="first"]').change(function () {
      setValue(0, parseInt($(this).val()));
    });
  });

  function hideFortune() {
    $('#fortune').fadeOut(2000, function() {
      $('#container').fadeIn(2000);
    });
  }

  $.ajax({
    url: '/fortunes',
    dataType: 'json'
  }).then(function (data) {
      var fortunes = data.fortunes;
      $('body').on('fortune', function (ev, num) {
        $('#container').fadeOut(2000, function () {
          $('#fortune').html(fortunes[num]).fadeIn(2000, function() {
            setTimeout(hideFortune, 5000);
          });
          $('#fortune').css('margin-top', -($('#fortune').height() / 2))
        });
      });
    });
})(jQuery);
