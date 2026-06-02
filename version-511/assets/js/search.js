(function () {
    const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
    const form = document.querySelector('[data-search-page-form]');
    const input = form ? form.querySelector('input[name="q"]') : null;
    const controls = document.querySelector('[data-search-controls]');
    const categorySelect = controls ? controls.querySelector('select[name="category"]') : null;
    const typeSelect = controls ? controls.querySelector('select[name="type"]') : null;
    const yearSelect = controls ? controls.querySelector('select[name="year"]') : null;
    const results = document.querySelector('[data-search-results]');
    const title = document.querySelector('[data-search-title]');
    const count = document.querySelector('[data-search-count]');

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function movieMatches(movie, keyword, category, type, year) {
        const haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category,
            movie.oneLine,
            (movie.tags || []).join(' '),
        ].join(' '));
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesCategory = !category || movie.category === category;
        const matchesType = !type || movie.type === type;
        const matchesYear = !year || movie.year === year;
        return matchesKeyword && matchesCategory && matchesType && matchesYear;
    }

    function card(movie) {
        const tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>#' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card movie-card-small">',
            '    <a href="video/' + escapeHtml(movie.id) + '.html" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <div class="card-cover">',
            '            <img src="' + escapeHtml(movie.coverRoot) + '" alt="' + escapeHtml(movie.title) + '" class="card-image" loading="lazy" data-cover-image>',
            '            <div class="card-shade"></div>',
            '            <div class="play-float">▶</div>',
            '        </div>',
            '        <div class="card-content">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <p>' + escapeHtml(movie.oneLine) + '</p>',
            '            <div class="card-meta">',
            '                <span>' + escapeHtml(movie.category) + '</span>',
            '                <span>' + escapeHtml(movie.duration) + '</span>',
            '            </div>',
            '            <div class="card-tags">' + tags + '</div>',
            '        </div>',
            '    </a>',
            '</article>',
        ].join('\n');
    }

    function apply() {
        if (!results) {
            return;
        }

        const keyword = normalize(input ? input.value : '');
        const category = categorySelect ? categorySelect.value : '';
        const type = typeSelect ? typeSelect.value : '';
        const year = yearSelect ? yearSelect.value : '';
        const matched = movies
            .filter(function (movie) {
                return movieMatches(movie, keyword, category, type, year);
            })
            .slice(0, 200);

        if (title) {
            title.textContent = keyword ? '搜索结果' : '热门搜索推荐';
        }

        if (count) {
            count.textContent = '找到 ' + matched.length + ' 部，最多展示 200 部';
        }

        results.innerHTML = matched.map(card).join('\n');

        results.querySelectorAll('[data-cover-image]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
                image.removeAttribute('src');
            }, { once: true });
        });
    }

    function initFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const keyword = params.get('q') || '';
        if (input) {
            input.value = keyword;
        }
        apply();
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const params = new URLSearchParams(window.location.search);
            params.set('q', input ? input.value : '');
            window.history.replaceState(null, '', 'search.html?' + params.toString());
            apply();
        });
    }

    [input, categorySelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        }
    });

    document.addEventListener('DOMContentLoaded', initFromQuery);
    initFromQuery();
}());
