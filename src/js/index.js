var videoPlayer = new VrajPlayer({
    root: document.getElementById("videoPlayer"),
    video: document.getElementById("videoScreen"),
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    slider: document.querySelector(".video-player .features .extras .slider"),
    controls: document.querySelector(".video-player .features .extras .controls")
});