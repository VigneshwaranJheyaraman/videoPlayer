(function(second_module) {
    return second_module(window);
})(function(globalVariable) {
    function MediaPlayer({ video, progress, buffered, seeker, controls, slider, rootEl }) {
        var mediaController = {};
        var mediaSeeking = false;
        rootEl = rootEl ? rootEl : document.querySelector("body");
        var sliderWidth = slider.offsetWidth;
        var video_offset = getElementOffset(video);
        var currentLeft = 0;

        updateProgress(currentLeft, false);
        updateSeeker(currentLeft, false);

        function getElementOffset(element) {
            var offset = { left: 0, top: 0 };
            if (element) {
                offset = element.getBoundingClientRect();
            }
            return {
                left: offset.left + window.pageXOffset - document.documentElement.clientLeft,
                top: offset.top + window.pageYOffset - document.documentElement.clientTop
            };
        }

        function updateCurrentTime(event) {
            var leftGapForElement = event.pageX - video_offset.left;
            var dragPercent = (leftGapForElement / sliderWidth);
            var videoCurrentTime = video.duration * dragPercent;
            if (videoCurrentTime <= video.duration) {
                video.currentTime = videoCurrentTime;
            } else {
                video.currentTime = video.duration;
            }
            currentLeft = leftGapForElement;
        }

        function calculateCurrentWidthBasedOnPlayTime() {
            return (video.currentTime / video.duration) * 100;
        }

        function updateSeeker(width, inPercent = true) {
            seeker.style.left = `calc(${width}${inPercent ? '%' : 'px'} - (var(--seeker-wd)/2))`;
        }

        mediaController.togglePlaying = function() {
            if (video.paused) {
                this.play();
            } else {
                this.pause();
            }
        }

        function updateProgress(width, inPercent = true) {
            progress.style.width = `${width}${inPercent ? '%' : 'px'}`;
        }

        function updateSeekerAndProgress() {
            var currentWidth = calculateCurrentWidthBasedOnPlayTime();
            updateSeeker(currentWidth);
            updateProgress(currentWidth);
        }
        mediaController.play = function() {
            video.play();
            updateSeekerAndProgress();
        }
        mediaController.pause = function() {
            video.pause();
        }
        mediaController.playing = function() {
            updateSeekerAndProgress();
        }
        mediaController.stop = function() {
            video.currentTime = video.duration;
            updateSeekerAndProgress();
        }
        mediaController.updateSliderWidth = function(newWidth) {
            sliderWidth = newWidth;
        }
        video.addEventListener("timeupdate", function() {
            if (!mediaSeeking) { mediaController.playing(); }
        });
        rootEl.addEventListener("mousedown", function(event) {
            if (event.target.classList.contains("seeker")) {
                mediaSeeking = true;
            }
        })
        slider.addEventListener("mousemove", function(event) {
            if (mediaSeeking) {
                updateCurrentTime(event);
                updateSeekerAndProgress();
            }
        });
        slider.addEventListener("click", function(event) {
            updateCurrentTime(event);
            updateSeekerAndProgress();
        });
        rootEl.addEventListener("mouseup", function(event) {
            mediaSeeking = false;
        });
        rootEl.addEventListener("mouseup", function(event) {
            if (mediaSeeking) {
                mediaSeeking = false;
                updateSeekerAndProgress();
            }
        })
        return mediaController;
    };

    globalVariable.MediaPlayer = MediaPlayer;
    return globalVariable;
})