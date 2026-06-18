(function () {
  function initPlayer() {
    var video = document.querySelector('[data-player]');
    var shell = document.querySelector('[data-player-shell]');
    var button = document.querySelector('[data-play-button]');

    if (!video || !shell) {
      return;
    }

    var source = video.getAttribute('data-src');
    var loaded = false;
    var activeHls = null;

    function loadSource() {
      if (loaded || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        activeHls = new window.Hls({ enableWorker: true });
        activeHls.loadSource(source);
        activeHls.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = source;
      loaded = true;
    }

    function startPlayback() {
      loadSource();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && !loaded) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (activeHls && typeof activeHls.destroy === 'function') {
        activeHls.destroy();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();
