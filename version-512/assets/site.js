(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentHero = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }

    currentHero = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentHero);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentHero);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHero(currentHero + 1);
    }, 5200);
  }

  function matchesCard(card, keyword) {
    if (!keyword) {
      return true;
    }

    var haystack = [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-genre') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();

    return haystack.indexOf(keyword.toLowerCase()) !== -1;
  }

  var cardFilter = document.querySelector('[data-card-filter]');
  var cardList = document.querySelector('[data-card-list]');
  var filterCount = document.querySelector('[data-filter-count]');

  if (cardFilter && cardList) {
    var cards = Array.prototype.slice.call(cardList.children);
    cardFilter.addEventListener('input', function () {
      var keyword = cardFilter.value.trim();
      var visible = 0;

      cards.forEach(function (card) {
        var matched = matchesCard(card, keyword);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = visible + ' 部影片';
      }
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback);
    document.head.appendChild(script);
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-button]');
    var src = shell.getAttribute('data-video-src');

    if (!video || !src) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      playVideo();
    } else {
      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = src;
          playVideo();
        }
      });
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  document.querySelectorAll('.video-shell').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var keywordInput = searchPage.querySelector('[data-search-keyword]');
    var regionSelect = searchPage.querySelector('[data-search-region]');
    var typeSelect = searchPage.querySelector('[data-search-type]');
    var yearSelect = searchPage.querySelector('[data-search-year]');
    var results = searchPage.querySelector('[data-search-results]');
    var count = searchPage.querySelector('[data-search-count]');
    var movies = [];

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderMovie(movie) {
      var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="movie/' + movie.id + '.html">',
        '    <div class="poster-art poster-tone-' + movie.tone + '">',
        '      <span class="poster-year">' + escapeHtml(movie.year_text || movie.year) + '</span>',
        '      <strong>' + escapeHtml(movie.title) + '</strong>',
        '      <small>' + escapeHtml(movie.genre || '') + '</small>',
        '    </div>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year_text || movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <h2><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.one_line || movie.summary || '') + '</p>',
        '    <div class="tag-list">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function applySearch() {
      var keyword = (keywordInput.value || '').trim().toLowerCase();
      var region = regionSelect.value;
      var type = typeSelect.value;
      var year = yearSelect.value;

      var matched = movies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.genre, movie.one_line, movie.summary].join(' ').toLowerCase();
        return (!keyword || text.indexOf(keyword) !== -1) &&
          (!region || movie.region === region) &&
          (!type || movie.type === type) &&
          (!year || String(movie.year) === year);
      }).slice(0, 160);

      results.innerHTML = matched.map(renderMovie).join('');
      count.textContent = '展示 ' + matched.length + ' 部影片';
    }

    fetch('assets/movie-index.json')
      .then(function (response) { return response.json(); })
      .then(function (payload) {
        movies = payload.movies || [];
        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (input) {
          input.addEventListener('input', applySearch);
          input.addEventListener('change', applySearch);
        });
      })
      .catch(function () {
        count.textContent = '搜索数据加载失败，请直接浏览分类页。';
      });
  }
})();
