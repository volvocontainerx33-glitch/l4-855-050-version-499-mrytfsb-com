(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var hero = document.querySelector('[data-hero]');
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader);

  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('active', itemIndex === index);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('active', itemIndex === index);
    });
    hero.setAttribute('data-current', String(index));
  }

  if (slides.length) {
    var current = 0;
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        current = index;
        showSlide(current);
      });
    });
    setInterval(function () {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var keywordInput = document.querySelector('[data-page-keyword]');
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var currentYear = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function applyFilter() {
    var keyword = keywordInput ? normalize(keywordInput.value.trim()) : '';
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre')
      ].join(' '));
      var year = card.getAttribute('data-year') || '';
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = currentYear === 'all' || year.indexOf(currentYear) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedYear));
    });
  }

  if (keywordInput) {
    keywordInput.addEventListener('input', applyFilter);
  }

  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentYear = button.getAttribute('data-year-filter') || 'all';
      yearButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });
})();
