(function () {
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var index = window.MOVIE_SEARCH_INDEX || [];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card poster-card" data-card>',
      '<a class="card-cover" href="./' + escapeHtml(movie.link) + '">',
      '<img src="./' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge">▶</span>',
      '<span class="corner-badge">' + escapeHtml(movie.region || movie.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="./' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function render(value) {
    var term = normalize(value.trim());
    var list;

    if (!term) {
      list = index.slice(0, 36);
      if (status) {
        status.textContent = '热门推荐';
      }
    } else {
      list = index.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags
        ].join(' ')).indexOf(term) !== -1;
      }).slice(0, 96);
      if (status) {
        status.textContent = list.length ? '搜索结果' : '未找到匹配影片';
      }
    }

    if (results) {
      results.innerHTML = list.map(cardTemplate).join('');
    }
  }

  if (input) {
    input.value = query;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value.trim() : '';
      var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.history.replaceState(null, '', nextUrl);
      render(value);
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(query);
})();
