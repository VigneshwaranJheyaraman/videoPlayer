var videoPlayer = new VrajPlayer({
    root: document.getElementById("vrajPlayer"),
    video: document.getElementById("videoScreen"),
    src: "http://192.168.1.2:8081/video",
    subtitleURL: "http://127.0.0.1:5500/sub",
    thumbURL: "https://images-na.ssl-images-amazon.com/images/I/816PXY-c-nL._RI_.jpg",
    slider: document.querySelector(".video-player .features .extras .slider"),
    controls: document.querySelector(".video-player .features .extras .controls"),
    overlay: document.querySelector(".play-pause-btn")
});