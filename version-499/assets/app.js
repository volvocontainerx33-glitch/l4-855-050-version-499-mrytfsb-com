(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var navLinks = document.querySelector('.nav-links');
        if (menuButton && navLinks) {
            menuButton.addEventListener('click', function () {
                navLinks.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    showSlide(i);
                });
            });
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-area]'));
        searchForms.forEach(function (area) {
            var input = area.querySelector('[data-search-input]');
            var select = area.querySelector('[data-search-select]');
            var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
            var apply = function () {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var region = select ? select.value : '';
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-tags') || ''
                    ].join(' ').toLowerCase();
                    var regionValue = card.getAttribute('data-region') || '';
                    var passKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var passRegion = !region || regionValue.indexOf(region) !== -1;
                    card.classList.toggle('hidden-card', !(passKeyword && passRegion));
                });
            };
            if (input) {
                input.addEventListener('input', apply);
            }
            if (select) {
                select.addEventListener('change', apply);
            }
        });
    });
})();

function setupMoviePlayer(videoUrl) {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.video-cover');
    var attached = false;

    function attach() {
        if (attached || !video) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function start() {
        attach();
        if (cover) {
            cover.classList.add('hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (cover) {
                    cover.classList.remove('hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                start();
            }
        });
    }
}
