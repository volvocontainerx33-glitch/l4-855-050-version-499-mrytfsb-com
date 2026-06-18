document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var slides = Array.from(document.querySelectorAll('.hero-slide'));
  var dots = Array.from(document.querySelectorAll('.hero-dot'));
  if (slides.length > 0) {
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  var searchInputs = Array.from(document.querySelectorAll('[data-movie-search]'));
  searchInputs.forEach(function (input) {
    var scope = document.querySelector(input.getAttribute('data-scope') || 'body') || document;
    var cards = Array.from(scope.querySelectorAll('.movie-card, .rank-item, .category-card'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  });

  Array.from(document.querySelectorAll('.player')).forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var started = false;
    var start = function () {
      if (!video || started) {
        return;
      }
      started = true;
      player.classList.add('started');
      var url = player.getAttribute('data-video');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  });
});
