import { H as Hls } from "./video-vendor-dru42stk.js";

window.Hls = Hls;

function setupStaticPlayer(player) {
  const video = player.querySelector("video");
  const cover = player.querySelector("[data-player-cover]");
  const button = player.querySelector("[data-player-button]");
  const status = player.querySelector("[data-player-status]");
  const sourceUrl = player.dataset.source;

  if (!video || !cover || !button || !sourceUrl) {
    return;
  }

  button.addEventListener("click", function () {
    cover.style.display = "none";
    status.textContent = "正在连接播放源...";

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 30
    });

    hls.loadSource(sourceUrl);
    hls.attachMedia(video);

    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {
        status.textContent = "播放器已载入，请再次点击播放。";
      });
    });

    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        status.textContent = "播放源暂时无法连接，请稍后重试或检查网络。";
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = sourceUrl;
    video.play().catch(function () {
      status.textContent = "播放器已载入，请再次点击播放。";
    });
  } else {
    video.src = sourceUrl;
    video.play().catch(function () {
      status.textContent = "当前浏览器不支持 HLS 播放，请使用支持 HLS 的浏览器访问。";
    });
  }

  });
}

document.querySelectorAll("[data-static-player]").forEach(setupStaticPlayer);
