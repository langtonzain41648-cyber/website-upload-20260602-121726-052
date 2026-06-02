(function () {
    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        if (!slides.length) {
            return;
        }

        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        var stage = document.querySelector('.hero-stage');
        if (stage) {
            stage.addEventListener('mouseenter', stop);
            stage.addEventListener('mouseleave', start);
        }

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            var list = section ? section.querySelector('.movie-list') : null;
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
            var input = panel.querySelector('.filter-input');
            var type = panel.querySelector('.filter-type');
            var year = panel.querySelector('.filter-year');
            var category = panel.querySelector('.filter-category');
            var count = panel.querySelector('.filter-count');

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var typeValue = normalize(type ? type.value : '');
                var yearValue = normalize(year ? year.value : '');
                var categoryValue = normalize(category ? category.value : '');
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var pass = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        pass = false;
                    }
                    if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                        pass = false;
                    }
                    if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                        pass = false;
                    }
                    if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
                        pass = false;
                    }

                    card.classList.toggle('is-filter-hidden', !pass);
                    if (pass) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [input, type, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
    });
})();
