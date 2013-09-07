(function ($) {
  $('#first, #second, #third').fillCanvas([
    'beakerhead', 'coin', 'crane', 'fan', 'koi',
    'lantern', 'lightbulb', 'robot', 'rocket', 'studio'
  ], function(images) {
    var positions = [];
    var current = 0;

    images.forEach(function(image) {
      positions.push(current);
      current += image.height;
    });

    $('[type="number"]').change(function() {
      $('#' + $(this).attr('name')).rotateTo(positions[$(this).val() % images.length])
    });
  });
})(jQuery);

