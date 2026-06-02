(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    function bindNavigation() {
        const searchButton = qs('[data-search-toggle]');
        const searchPanel = qs('[data-search-panel]');
        const menuButton = qs('[data-menu-toggle]');
        const mobilePanel = qs('[data-mobile-panel]');

        if (searchButton && searchPanel) {
            searchButton.addEventListener('click', function () {
                searchPanel.hidden = !searchPanel.hidden;
                if (!searchPanel.hidden) {
                    const input = qs('input', searchPanel);
                    if (input) {
                        input.focus();
                    }
                }
            });
        }

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.hidden = !mobilePanel.hidden;
            });
        }
    }

    function bindHero() {
        const hero = qs('[data-hero]');
        if (!hero) {
            return;
        }

        const slides = qsa('[data-hero-slide]', hero);
        const dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }

        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        start();
    }

    function bindCardFilter() {
        qsa('[data-card-filter]').forEach(function (form) {
            const input = qs('input', form);
            const select = qs('select', form);
            const section = form.closest('section');
            const cards = qsa('[data-card]', section || document);

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilter(event) {
                if (event) {
                    event.preventDefault();
                }

                const keyword = normalize(input ? input.value : '');
                const selected = normalize(select ? select.value : '');

                cards.forEach(function (card) {
                    const text = normalize([
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.category,
                        card.dataset.year,
                    ].join(' '));
                    const category = normalize(card.dataset.category);
                    const year = normalize(card.dataset.year);
                    const matchesKeyword = !keyword || text.includes(keyword);
                    const matchesSelect = !selected || category === selected || year === selected;
                    card.hidden = !(matchesKeyword && matchesSelect);
                });
            }

            form.addEventListener('submit', applyFilter);
            if (input) {
                input.addEventListener('input', applyFilter);
            }
            if (select) {
                select.addEventListener('change', applyFilter);
            }
        });
    }

    function bindImageFallbacks() {
        qsa('[data-cover-image]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
                image.removeAttribute('src');
            }, { once: true });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindNavigation();
        bindHero();
        bindCardFilter();
        bindImageFallbacks();
    });
}());
