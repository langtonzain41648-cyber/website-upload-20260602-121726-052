(function () {
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve();
                return;
            }

            const existing = document.querySelector('script[data-hls-loader]');
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.hlsLoader = 'true';
            script.addEventListener('load', resolve, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
        });
    }

    function createPlayer(shell) {
        const video = shell.querySelector('[data-video-player]');
        const toggle = shell.querySelector('[data-player-toggle]');
        const playButton = shell.querySelector('[data-player-play]');
        const muteButton = shell.querySelector('[data-player-mute]');
        const fullscreenButton = shell.querySelector('[data-player-fullscreen]');
        const loading = shell.querySelector('[data-player-loading]');
        const errorBox = shell.querySelector('[data-player-error]');
        const source = video ? video.dataset.src : '';
        let hls = null;
        let initialized = false;

        function setLoading(isLoading) {
            if (loading) {
                loading.hidden = !isLoading;
            }
        }

        function setError(message) {
            if (errorBox) {
                errorBox.textContent = message || '';
                errorBox.hidden = !message;
            }
        }

        function markPlaybackState() {
            shell.classList.toggle('is-playing', Boolean(video && !video.paused));
        }

        async function init() {
            if (!video || initialized) {
                return;
            }
            initialized = true;
            setError('');
            setLoading(true);

            try {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.controls = true;
                    setLoading(false);
                    return;
                }

                await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest');

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setLoading(false);
                        video.controls = true;
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setLoading(false);
                            setError('视频加载失败，请稍后重试。');
                            if (hls) {
                                hls.destroy();
                                hls = null;
                            }
                        }
                    });
                } else {
                    setLoading(false);
                    setError('当前浏览器不支持 HLS 播放。');
                }
            } catch (error) {
                setLoading(false);
                setError('播放器初始化失败，请检查网络后重试。');
            }
        }

        async function togglePlayback() {
            if (!video) {
                return;
            }
            await init();
            if (video.paused) {
                try {
                    await video.play();
                } catch (error) {
                    setError('播放启动失败，请再次点击播放。');
                }
            } else {
                video.pause();
            }
            markPlaybackState();
        }

        if (!video || !source) {
            setError('未找到可用播放源。');
            return;
        }

        if (toggle) {
            toggle.addEventListener('click', togglePlayback);
        }

        if (playButton) {
            playButton.addEventListener('click', togglePlayback);
        }

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }

        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', markPlaybackState);
        video.addEventListener('pause', markPlaybackState);
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.player-shell').forEach(createPlayer);
    });
}());
