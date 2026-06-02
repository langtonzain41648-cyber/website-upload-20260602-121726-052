document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

  filterInputs.forEach(function (input) {
    var targetSelector = input.getAttribute('data-card-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
    var empty = document.querySelector(input.getAttribute('data-empty-target') || '');

    function runFilter() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.classList.toggle('hidden-by-filter', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', runFilter);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input.name === 'q') {
      input.value = query;
    }

    runFilter();
  });
});
