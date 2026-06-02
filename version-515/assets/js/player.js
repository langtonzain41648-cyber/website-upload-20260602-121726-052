document.addEventListener('DOMContentLoaded', function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var source = player.getAttribute('data-src');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
  var attached = false;
  var hls = null;

  function attachSource() {
    if (attached || !video || !source) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();
    player.classList.add('is-playing');
    video.play().catch(function () {
      player.classList.remove('is-playing');
    });
  }

  triggers.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      startPlayback();
      player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  video.addEventListener('click', function () {
    attachSource();

    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      player.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
