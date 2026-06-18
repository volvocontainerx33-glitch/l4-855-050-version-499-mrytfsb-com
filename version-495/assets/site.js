(function() {
  const header = document.querySelector("[data-site-header]");
  const menuButton = document.querySelector("[data-menu-button]");

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 48);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (header && menuButton) {
    menuButton.addEventListener("click", function() {
      header.classList.toggle("menu-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      const input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      const value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = "./search.html";
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(value);
    });
  });

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        setSlide(current + 1);
      }, 6200);
    }
  }

  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const searchInput = document.querySelector("[data-search-input]");
  const regionSelect = document.querySelector("[data-filter-region]");
  const typeSelect = document.querySelector("[data-filter-type]");
  const yearSelect = document.querySelector("[data-filter-year]");
  const emptyState = document.querySelector("[data-empty-state]");

  function uniqueValues(name) {
    return Array.from(new Set(cards.map(function(card) {
      return card.dataset[name] || "";
    }).filter(Boolean))).sort(function(a, b) {
      return b.localeCompare(a, "zh-CN");
    });
  }

  function fillSelect(select, name) {
    if (!select) {
      return;
    }
    uniqueValues(name).forEach(function(value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(regionSelect, "region");
  fillSelect(typeSelect, "type");
  fillSelect(yearSelect, "year");

  function currentQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  if (searchInput && currentQuery()) {
    searchInput.value = currentQuery();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const region = regionSelect ? regionSelect.value : "";
    const type = typeSelect ? typeSelect.value : "";
    const year = yearSelect ? yearSelect.value : "";
    let visible = 0;

    cards.forEach(function(card) {
      const text = card.textContent.toLowerCase();
      const matched = (!keyword || text.includes(keyword)) &&
        (!region || card.dataset.region === region) &&
        (!type || card.dataset.type === type) &&
        (!year || card.dataset.year === year);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("show", visible === 0);
    }
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function(control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });

  filterCards();

  window.initVideo = function(videoId, buttonId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }

    let ready = false;
    let hls = null;

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      button.classList.add("is-hidden");
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (!ready) {
        play();
      }
    });
    window.addEventListener("pagehide", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
