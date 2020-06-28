var videoPlayer = new VrajPlayer({
    root: document.getElementById("vrajPlayer"),
    video: document.getElementById("videoScreen"),
    src: "https://thepaciellogroup.github.io/AT-browser-tests/video/ElephantsDream.mp4",
    subtitleURL: "http://127.0.0.1:5500/sub",
    slider: document.querySelector(".video-player .features .extras .slider"),
    controls: document.querySelector(".video-player .features .extras .controls"),
    overlay: document.querySelector(".play-pause-btn")
});