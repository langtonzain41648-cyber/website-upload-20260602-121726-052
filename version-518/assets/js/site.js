(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shortText(value, length) {
    var str = String(value || '');
    return str.length > length ? str.slice(0, length) + '…' : str;
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove('active');
      if (dots[index]) {
        dots[index].classList.remove('active');
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function setupLocalFilters() {
    var row = qs('[data-filter-row]');
    var list = qs('[data-filter-list]');
    if (!row || !list) {
      return;
    }
    var buttons = qsa('[data-filter]', row);
    var cards = qsa('[data-movie-card]', list);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matched = filter === 'all' || haystack.indexOf(text(filter)) !== -1;
          card.classList.toggle('hidden-by-filter', !matched);
        });
      });
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (input && input.value.trim()) {
          return;
        }
        event.preventDefault();
        if (input) {
          input.focus();
        }
      });
    });
  }

  function cardHtml(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster">',
      '      <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="region-badge">' + escapeHtml(shortText(movie.region, 12)) + '</span>',
      '      <span class="poster-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(shortText(movie.type, 8)) + ' · ' + escapeHtml(shortText(movie.genre, 20)) + '</p>',
      '      <p class="movie-line">' + escapeHtml(shortText(movie.oneLine, 76)) + '</p>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var container = qs('[data-search-results]');
    if (!container || !window.MOVIE_LIST) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = text(params.get('q') || '');
    var input = qs('.large-search input[name="q"]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var activeFilter = 'all';
    var buttons = qsa('[data-search-filter]');

    function matchMovie(movie) {
      var haystack = text([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));
      var queryMatched = !query || haystack.indexOf(query) !== -1;
      var filterMatched = activeFilter === 'all' || activeFilter.split(' ').some(function (part) {
        return part && haystack.indexOf(text(part)) !== -1;
      });
      return queryMatched && filterMatched;
    }

    function render() {
      var list = window.MOVIE_LIST.filter(matchMovie).slice(0, 120);
      if (!list.length) {
        container.innerHTML = '<div class="empty-result">没有找到相关影片</div>';
        return;
      }
      container.innerHTML = list.map(cardHtml).join('');
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-search-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        render();
      });
    });

    render();
  }

  function setupPlayers() {
    qsa('.movie-video').forEach(function (video) {
      var stream = video.getAttribute('data-stream');
      var frame = video.closest('.video-frame');
      var overlay = frame ? qs('.video-overlay', frame) : null;
      if (!stream) {
        return;
      }

      function bindStream() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }

      function startPlay() {
        bindStream();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', startPlay);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupSearchForms();
    setupSearchPage();
    setupPlayers();
  });
})();
