(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5000);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var applyFilters = function () {
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var selected = {};
    filterSelects.forEach(function (select) {
      selected[select.getAttribute('data-filter')] = select.value;
    });
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var ok = true;
      if (query && haystack.indexOf(query) === -1) {
        ok = false;
      }
      Object.keys(selected).forEach(function (key) {
        if (!selected[key]) {
          return;
        }
        var value = (card.getAttribute('data-' + key) || '').toLowerCase();
        var wanted = selected[key].toLowerCase();
        if (key === 'tags') {
          value = (card.getAttribute('data-tags') || '').toLowerCase();
        }
        if (value.indexOf(wanted) === -1) {
          ok = false;
        }
      });
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };
  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
})();

function initPlayer(src, videoId, buttonId, overlayId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var hls = null;
  var loaded = false;
  if (!video) {
    return;
  }
  var load = function () {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  };
  var start = function () {
    load();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };
  if (button) {
    button.addEventListener('click', start);
  }
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (!loaded) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
