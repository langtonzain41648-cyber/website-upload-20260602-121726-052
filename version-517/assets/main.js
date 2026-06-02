document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  let activeSlide = 0;

  function showSlide(index) {
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
  }

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      activeSlide = (activeSlide + 1) % slides.length;
      showSlide(activeSlide);
    }, 5200);
  }

  const filterBlocks = Array.from(document.querySelectorAll("[data-filter-block]"));

  filterBlocks.forEach(function (block) {
    const input = block.querySelector("[data-search-input]");
    const yearSelect = block.querySelector("[data-year-filter]");
    const regionSelect = block.querySelector("[data-region-filter]");
    const typeSelect = block.querySelector("[data-type-filter]");
    const cards = Array.from(block.querySelectorAll("[data-title]"));
    const noResults = block.querySelector("[data-no-results]");

    function matchCard(card) {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      const searchable = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.textContent
      ].join(" ").toLowerCase();

      const matchesKeyword = !keyword || searchable.includes(keyword);
      const matchesYear = !year || card.dataset.year === year;
      const matchesRegion = !region || card.dataset.region.includes(region);
      const matchesType = !type || card.dataset.type.includes(type);

      return matchesKeyword && matchesYear && matchesRegion && matchesType;
    }

    function applyFilter() {
      let visibleCount = 0;

      cards.forEach(function (card) {
        const visible = matchCard(card);
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount ? "none" : "block";
      }
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  const backTop = document.createElement("button");
  backTop.className = "back-top";
  backTop.type = "button";
  backTop.setAttribute("aria-label", "返回顶部");
  backTop.textContent = "↑";
  document.body.appendChild(backTop);

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", function () {
    backTop.classList.toggle("is-visible", window.scrollY > 420);
  });
});
