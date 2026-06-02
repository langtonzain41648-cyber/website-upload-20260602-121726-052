(function () {
    function attach(videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
                loaded = true;
                return;
            }

            video.src = source;
            loaded = true;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function play() {
            loadSource();
            hideOverlay();
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!loaded) {
                play();
            }
        });

        video.addEventListener('play', hideOverlay);
    }

    window.MoviePlayer = {
        attach: attach
    };
})();
