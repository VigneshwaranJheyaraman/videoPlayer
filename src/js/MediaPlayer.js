(function(second_module) {
    return second_module(window);
})(function(globalVariable) {
    function MediaPlayer({ video, progress, buffered, seeker, controls, slider, rootEl }) {
        var mediaController = {};
        var mediaSeeking = false;
        rootEl = rootEl ? rootEl : document.querySelector("body");
        var sliderWidth = slider.offsetWidth;
        var video_offset = getElementOffset(video);
        var lastTime = 0,
            lastLeft = 0,
            isSliderHovering = false;

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
            updateLastSliderPosition(leftGapForElement);
            var dragPercent = (leftGapForElement / sliderWidth);
            var videoCurrentTime = video.duration * dragPercent;
            lastTime = videoCurrentTime;
        }

        function updateVideoTime(newTime) {
            if (newTime < video.duration) {
                video.currentTime = newTime;
            } else {
                if (video.duration) {
                    video.currentTime = video.duration;
                }
            }
        }

        function updateLastSliderPosition(pos) {
            if (pos < sliderWidth) {
                lastLeft = pos;
            } else {
                lastLeft = sliderWidth;
            }
        }

        function calculateCurrentWidthBasedOnPlayTime() {
            return (lastTime / video.duration) * 100;
        }

        function updateSeeker(width, inPercent = true) {
            if (width || width === 0) {
                seeker.style.left = isSliderHovering ? `calc(${width}${inPercent ? '%' : 'px'} - (var(--seeker-wd)/2))` : `${width}${inPercent ? '%' : 'px'}`;
            }
        }

        mediaController.togglePlaying = function() {
            if (video.paused) {
                this.play();
            } else {
                this.pause();
            }
        }

        function replayMedia() {
            updateLastSliderPosition(0);
            lastTime = 0;
            updateSeekerAndProgress();
            video.play();
        }

        function updateProgress(width, inPercent = true) {
            progress.style.width = `${width}${inPercent ? '%' : 'px'}`;
        }

        function updateSeekerAndProgress() {
            updateSeeker(lastLeft, false);
            updateProgress(lastLeft, false);
        }
        mediaController.play = function() {
            if (lastTime === video.duration) {
                replayMedia();
            } else {
                video.play();
                updateSeekerAndProgress();
            }
        }
        mediaController.pause = function() {
            video.pause();
        }
        mediaController.playing = function() {
            updateSeekerAndProgress();
        }
        mediaController.stop = function() {
            video.currentTime = video.duration;
            lastTime = video.currentTime;
            updateLastSliderPosition(sliderWidth);
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
        });
        rootEl.addEventListener("mousemove", function(event) {
            if (mediaSeeking) {
                updateCurrentTime(event);
                updateSeekerAndProgress();
            }
        });
        slider.addEventListener("mouseover", function() {
            isSliderHovering = true;
        });
        slider.addEventListener("mouseout", function() {
            isSliderHovering = false;
        });
        slider.addEventListener("click", function(event) {
            updateCurrentTime(event);
            updateVideoTime(lastTime);
            updateSeekerAndProgress();
        });
        rootEl.addEventListener("mouseup", function(event) {
            if (mediaSeeking) {
                mediaSeeking = false;
                updateVideoTime(lastTime);
                updateSeekerAndProgress();
            }
        });
        return mediaController;
    };

    globalVariable.MediaPlayer = MediaPlayer;
    return globalVariable;
})