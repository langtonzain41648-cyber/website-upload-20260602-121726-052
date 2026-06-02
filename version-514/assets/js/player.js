(function () {
  function initVideo(video, source) {
    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  window.initializeStaticMoviePlayer = function (options) {
    var shell = document.querySelector(options.selector);
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var source = options.source;

    if (!video || !source) {
      return;
    }

    function start() {
      initVideo(video, source).then(function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
