class MediaController {
    constructor(props) {
        this.__videoElement = props.videoElement;
        this.__totalDuration = props.videoElement.duration;
        this.__updateProgressPercent = 0;
        this.__sliderWidth = props.sliderWidth;
        this.__lastWatchTime = 0;
        this.__lastProgressPixel = 0;
        this.__currentlyPlaying = false;
        this.__watched = false;
        this.__positionOffset = { left: 0, top: 0 };
        this.__playbackOffset = 0.25;
        this.__maxPlayBack = 3.0;
        this.__constPlayBack = 1.0;
        this.__skipOffset = 10 * 1e3;
        this.__progressCB = props.progressCB ? props.progressCB : null;
        this.__startedSeeking = false;
        this.__updatePositionOffset = this.__updatePositionOffset.bind(this);
        this.__calculateDragProgress = this.__calculateDragProgress.bind(this);
        this.__didCompletedWatching = this.__didCompletedWatching.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.stop = this.stop.bind(this);
        this.fastFwd = this.fastFwd.bind(this);
        this.fastBwd = this.fastBwd.bind(this);
        this.seek = this.seek.bind(this);
        this.skipFwd = this.skipFwd.bind(this);
        this.skipBwd = this.skipBwd.bind(this);
        this.__initializeVideoPlaybackEvents = this.__initializeVideoPlaybackEvents.bind(this);
        this.__unsubscribe = this.__unsubscribe.bind(this);
        this.__updateProgress = this.__updateProgress.bind(this);
        this.__updatePositionOffset();
        this.__initializeVideoPlaybackEvents();
    }

    get progressPercent() {
        return this.__updateProgressPercent + "%";
    }
    set progressPercent(updateProgress) {
        if (updateProgress < 100) {
            this.__updateProgressPercent = updateProgress;
        } else if (updateProgress <= 0) {
            this.__updateProgressPercent = 0;
        } else {
            this.__updateProgressPercent = 100;
        }
    }

    get duration() {
        return this.__totalDuration;
    }

    get lastTime() {
        return this.__lastWatchTime;
    }
    set lastTime(lastTime) {
        if (lastTime < this.duration) {
            this.__lastWatchTime = lastTime;
        } else if (lastTime < 0) {
            this.__lastWatchTime = 0;
        } else {
            this.__lastWatchTime = this.duration;
        }
    }

    get progressPixel() {
        return this.__lastProgressPixel + "px";
    }
    set progressPixel(newPixel) {
        if (newPixel < this.__sliderWidth) {
            this.__lastProgressPixel = newPixel;
        } else if (newPixel <= 0) {
            this.__lastProgressPixel = 0;
        } else {
            this.__lastProgressPixel = this.__sliderWidth;
        }
    }

    get isPlaying() {
        return this.__currentlyPlaying;
    }
    set isPlaying(update) {
        this.__currentlyPlaying = update;
    }

    get progressCB() {
        return this.__progressCB;
    }
    set progressCB(newCB) {
        this.__progressCB = newCB;
    }

    get isSeeking() {
        return this.__startedSeeking;
    }
    set isSeeking(newSeek) {
        this.__startedSeeking = newSeek;
    }

    get completedWatching() {
        return this.__watched;
    }
    set completedWatching(completed) {
        this.__watched = completed;
    }

    __updatePositionOffset() {
        this.__positionOffset.left += window.pageXOffset + document.documentElement.clientLeft;
        this.__positionOffset.top += window.pageYOffset + document.documentElement.clientTop;
    }

    __calculateDragProgress(event, lastTime = undefined) {
        this.__didCompletedWatching();
        var progressPixel = event.pageX - this.__positionOffset.left;
        var progressPercent = (progressPixel / this.__sliderWidth) * 100;
        this.progressPixel = progressPixel;
        this.progressPercent = progressPercent;
        this.lastTime = !lastTime ? this.duration * (progressPercent / 100) : lastTime;
        this.progressCB && this.progressCB();
    }

    __calculateProgress() {
        this.lastTime = this.__videoElement.currentTime;
        this.progressPercent = (this.lastTime / this.duration) * 100;
        this.progressPixel = this.__sliderWidth * (this.__updateProgressPercent / 100);
        this.progressCB && this.progressCB();
    }

    __didCompletedWatching() {
        if (this.lastTime === this.duration) {
            this.completedWatching = true;
        }
    }

    play() {
        if (this.completedWatching) {
            this.lastTime = 0;
            this.progressPercent = 0;
            this.progressPixel = 0;
            this.completedWatching = false;
            this.progressCB && this.progressCB();
        }
        this.__videoElement.play();
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
        this.__videoElement.pause();
    }

    stop() {
        this.isPlaying = false;
        this.lastTime = this.duration;
        this.progressPercent = 100;
        this.progressPixel = this.__sliderWidth;
        this.__videoElement.currentTime = this.duration;
        this.progressCB && this.progressCB();
        this.__didCompletedWatching();
        this.pause();
    }

    fastFwd() {
        this.pause();
        if (this.__videoElement.playbackRate < this.__maxPlayBack) {
            this.__videoElement.playbackRate += this.__playbackOffset;
        }
        this.play();
    }

    fastBwd() {
        this.pause();
        if (this.__videoElement.playbackRate > this.__constPlayBack) {
            this.__videoElement.playbackRate -= this.__playbackOffset;
        }
        this.play();
    }

    seek(e) {
        if (this.isSeeking) {
            e = e || window.event;
            this.__calculateDragProgress(e);
            this.__videoElement.currentTime = this.lastTime;
            this.play();
        }
    }

    skipFwd(e) {
        this.__calculateDragProgress(e, this.lastTime + this.__skipOffset);
    }

    skipBwd(e) {
        this.__calculateDragProgress(e, this.lastTime - this.__skipOffset);
    }

    __initializeVideoPlaybackEvents() {
        this.__videoElement.addEventListener("timeupdate", this.__updateProgress);
        window.addEventListener("unload", this.__unsubscribe);
    }

    __updateProgress() {
        if (this.isPlaying && !this.isSeeking) {
            this.__calculateProgress();
        }
    }

    __unsubscribe() {
        window.removeEventListener("load", this.__initializeVideoPlaybackEvents);
        this.__videoElement.removeEventListener("timeupdate", this.__updateProgress);
    }
}