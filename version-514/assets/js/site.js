(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var header = qs('.site-header');
  var navToggle = qs('[data-nav-toggle]');

  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('section') || document;
    var cards = qsa('.movie-card', scope);
    var input = qs('[data-search-input]', panel);
    var selects = qsa('[data-filter]', panel);
    var reset = qs('[data-filter-reset]', panel);
    var count = qs('[data-filter-count]', scope);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = normalize(select.value);
      });

      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = !keyword || text.indexOf(keyword) !== -1;

        Object.keys(filters).forEach(function (key) {
          if (!filters[key]) {
            return;
          }
          if (key === 'category') {
            ok = ok && text.indexOf(filters[key]) !== -1;
          } else {
            ok = ok && normalize(card.getAttribute('data-' + key)).indexOf(filters[key]) !== -1;
          }
        });

        card.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        apply();
      });
    }

    apply();
  });
})();
