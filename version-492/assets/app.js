(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            const open = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
    const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
    let heroIndex = 0;

    function showHeroSlide(index) {
        if (!heroSlides.length) {
            return;
        }
        heroIndex = (index + heroSlides.length) % heroSlides.length;
        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === heroIndex);
        });
        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === heroIndex);
        });
    }

    if (heroSlides.length) {
        heroDots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showHeroSlide(index);
            });
        });
        window.setInterval(function () {
            showHeroSlide(heroIndex + 1);
        }, 6500);
    }

    const categorySearch = document.querySelector("[data-category-search]");
    const categoryCards = Array.from(document.querySelectorAll(".movie-card"));
    const noResults = document.querySelector(".no-results");

    if (categorySearch && categoryCards.length) {
        categorySearch.addEventListener("input", function () {
            const keyword = categorySearch.value.trim().toLowerCase();
            let visible = 0;
            categoryCards.forEach(function (card) {
                const text = [
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.year
                ].join(" ").toLowerCase();
                const matched = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle("is-visible", visible === 0);
            }
        });
    }

    const searchPage = document.querySelector("[data-search-page]");

    if (searchPage && window.SITE_MOVIES) {
        const params = new URLSearchParams(window.location.search);
        const qInput = searchPage.querySelector("[data-search-input]");
        const regionButtons = Array.from(searchPage.querySelectorAll("[data-region-filter]"));
        const results = searchPage.querySelector("[data-search-results]");
        const title = searchPage.querySelector("[data-search-title]");
        let activeRegion = params.get("region") || "全部";

        if (qInput) {
            qInput.value = params.get("q") || "";
        }

        function cardTemplate(movie) {
            const tags = movie.tags.slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return [
                "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\">",
                "<a href=\"" + movie.url + "\" class=\"card-cover\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"play-mark\">▶</span>",
                "<span class=\"region-pill\">" + escapeHtml(movie.region) + "</span>",
                "</a>",
                "<div class=\"card-body\">",
                "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>",
                "<p>" + escapeHtml(movie.oneLine) + "</p>",
                "<div class=\"meta-row\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
                "<div class=\"mini-tags\">" + tags + "</div>",
                "</div>",
                "</article>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>'"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "'": "&#39;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function renderSearch() {
            const keyword = (qInput ? qInput.value.trim() : "").toLowerCase();
            regionButtons.forEach(function (button) {
                button.classList.toggle("is-active", button.dataset.regionFilter === activeRegion);
            });

            const matched = window.SITE_MOVIES.filter(function (movie) {
                const text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    movie.tags.join(" ")
                ].join(" ").toLowerCase();
                const regionOk = activeRegion === "全部" || movie.region.indexOf(activeRegion) !== -1 || movie.category === activeRegion;
                return regionOk && (!keyword || text.indexOf(keyword) !== -1);
            });

            if (title) {
                title.textContent = keyword ? "影片搜索" : activeRegion === "全部" ? "全部影片" : activeRegion;
            }
            if (results) {
                results.innerHTML = matched.map(cardTemplate).join("");
            }
            if (noResults) {
                noResults.classList.toggle("is-visible", matched.length === 0);
            }
        }

        regionButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeRegion = button.dataset.regionFilter;
                renderSearch();
            });
        });

        if (qInput) {
            qInput.addEventListener("input", renderSearch);
        }

        renderSearch();
    }
})();
