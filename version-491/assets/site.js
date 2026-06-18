(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");

    function refreshHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    refreshHeader();
    window.addEventListener("scroll", refreshHeader, { passive: true });

    if (button && panel && header) {
      button.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        header.classList.toggle("is-open", open);
        document.body.classList.toggle("no-scroll", open);
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }

    var input = filterRoot.querySelector("[data-filter-input]");
    var region = filterRoot.querySelector("[data-filter-region]");
    var type = filterRoot.querySelector("[data-filter-type]");
    var genre = filterRoot.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-card]"));
    var empty = filterRoot.querySelector("[data-filter-empty]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var selectedGenre = normalize(genre && genre.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardGenre = normalize(card.getAttribute("data-genre"));

        var match = true;
        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          match = false;
        }
        if (selectedType && cardType !== selectedType) {
          match = false;
        }
        if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
          match = false;
        }

        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, type, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video[data-stream]");
      var overlay = box.querySelector("[data-player-overlay]");
      var controls = Array.prototype.slice.call(box.querySelectorAll("[data-play]"));
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function loadVideo() {
        var url = video.getAttribute("data-stream");
        if (!url || box.getAttribute("data-ready") === "1") {
          return;
        }

        box.setAttribute("data-ready", "1");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 40,
            enableWorker: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }
      }

      function play() {
        loadVideo();
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      controls.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      });

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
