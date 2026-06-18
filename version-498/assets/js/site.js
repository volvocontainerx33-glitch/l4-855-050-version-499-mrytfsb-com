(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindSearchAndFilters();
    bindPlayers();
  });

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindSearchAndFilters() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));
    if (!input && chips.length === 0) {
      return;
    }
    var currentType = 'all';

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchType = currentType === 'all' || type === currentType;
        var show = matchText && matchType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentType = chip.getAttribute('data-type-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });

    apply();
  }

  function bindPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var status = player.querySelector('[data-player-status]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-src');
      var attached = false;
      var hls = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function attachSource() {
        if (attached || !source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute('controls', 'controls');
        attached = true;
      }

      function startPlayback() {
        attachSource();
        button.classList.add('is-hidden');
        setStatus('正在加载高清播放源');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('点击视频控件继续播放');
          });
        }
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (!attached) {
          startPlayback();
        }
      });
      video.addEventListener('playing', function () {
        setStatus('');
      });
      video.addEventListener('error', function () {
        setStatus('当前播放源暂时无法加载');
        if (hls) {
          hls.destroy();
          hls = null;
          attached = false;
        }
      });
    });
  }
}());
