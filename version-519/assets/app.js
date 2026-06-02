document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-button");
  var mainNav = document.querySelector(".main-nav");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      var opened = mainNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(activeIndex + 1);
    }, 5600);
  }

  var searchInput = document.querySelector("[data-movie-search]");
  var categoryFilter = document.querySelector("[data-category-filter]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterMovies() {
    if (!cards.length) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : "");
    var category = categoryFilter ? categoryFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";

    cards.forEach(function (card) {
      var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-year"));
      var cardCategory = card.getAttribute("data-category") || "";
      var cardType = card.getAttribute("data-type") || "";
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedCategory = !category || cardCategory === category;
      var matchedType = !type || cardType === type;
      card.style.display = matchedQuery && matchedCategory && matchedType ? "" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterMovies);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterMovies);
  }
  if (typeFilter) {
    typeFilter.addEventListener("change", filterMovies);
  }

  filterMovies();
});
