class MediaController {
    constructor(props) {
        this.__videoElement = props.videoElement;
        this.__totalDuration = props.videoElement.duration;
        this.__updateProgressPercent = 0;
        this.__sliderWidth = props.sliderWidth;
        this.__lastWatchTime = 0;
        this.__lastProgressPixel = 0;
        this.__currentlyPlaying = false;
        this.__buffered = { lastTime: 0, progressPixel: 0, progressPercent: 0, cb: props.bufferCB };
        this.__watched = false;
        this.__positionOffset = { left: 0, top: 0 };
        this.__playbackOffset = 0.25;
        this.__maxPlayBack = 3.0;
        this.__constPlayBack = 1.0;
        this.__skipOffset = 3;
        this.__volumeOffset = 0.1;
        this.__videoVolume = 1;
        this.isMuted = this.__checkIsMuted;
        this.__progressCB = props.progressCB ? props.progressCB : null;
        this.__startedSeeking = false;
        this.initProps = this.initProps.bind(this);
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
        this.__calculateSkipProgress = this.__calculateSkipProgress.bind(this);
        this.__updateLastBuffer = this.__updateLastBuffer.bind(this);
        this.__updateLastTime = this.__updateLastTime.bind(this);
        this.__updateProgressPercentValue = this.__updateProgressPercentValue.bind(this);
        this.__updateProgressPixelValue = this.__updateProgressPixelValue.bind(this);
        this.increaseVol = this.increaseVol.bind(this);
        this.decreaseVol = this.decreaseVol.bind(this);
        this.__checkIsMuted = this.__checkIsMuted.bind(this);
        this.__updatePositionOffset();
        this.__initializeVideoPlaybackEvents();
    }

    get progressPercent() {
        return this.__updateProgressPercent + "%";
    }
    set progressPercent(updateProgress) {
        this.__updateProgressPercent = this.__updateProgressPercentValue(updateProgress);
    }

    get buffered() {
        return this.__buffered;
    }

    get duration() {
        return this.__totalDuration;
    }

    get lastTime() {
        return this.__lastWatchTime;
    }
    set lastTime(lastTime) {
        this.__lastWatchTime = this.__updateLastTime(lastTime);
    }

    get progressPixel() {
        return this.__lastProgressPixel + "px";
    }
    set progressPixel(newPixel) {
        this.__lastProgressPixel = this.__updateProgressPixelValue(newPixel);
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

    get volume() {
        return this.__videoVolume;
    }
    set volume(newVolume) {
        if (newVolume < 1) {
            this.__videoVolume = newVolume;
        } else if (newVolume <= 0) {
            this.__videoVolume = 0;
        } else {
            this.__videoVolume = 1;
        }
    }

    get completedWatching() {
        return this.__watched;
    }
    set completedWatching(completed) {
        this.__watched = completed;
    }

    initProps() {
        this.__updateProgressPercent = 0;
        this.__lastWatchTime = 0;
        this.__lastProgressPixel = 0;
        this.__currentlyPlaying = false;
        this.__buffered = Object.assign({}, this.__buffered, { lastTime: 0, progressPixel: 0, progressPercent: 0 });
        this.__watched = false;
        this.__positionOffset = { left: 0, top: 0 };
        this.__playbackOffset = 0.25;
        this.__maxPlayBack = 3.0;
        this.__constPlayBack = 1.0;
        this.__skipOffset = 3;
        this.__volumeOffset = 0.1;
        this.__videoVolume = 1;
    }

    __updatePositionOffset() {
        this.__positionOffset.left += window.pageXOffset + document.documentElement.clientLeft;
        this.__positionOffset.top += window.pageYOffset + document.documentElement.clientTop;
    }

    __calculateDragProgress(event) {
        this.__didCompletedWatching();
        var progressPixel = event.pageX - this.__positionOffset.left;
        var progressPercent = (progressPixel / this.__sliderWidth) * 100;
        this.progressPixel = progressPixel;
        this.progressPercent = progressPercent;
        this.lastTime = this.duration * (progressPercent / 100);
        this.progressCB && this.progressCB();
    }

    __calculateProgress() {
        this.lastTime = this.__videoElement.currentTime;
        this.progressPercent = (this.lastTime / this.duration) * 100;
        this.progressPixel = this.__sliderWidth * (this.__updateProgressPercent / 100);
        this.__didCompletedWatching();
        this.progressCB && this.progressCB();
    }

    __calculateSkipProgress(newTime) {
        this.lastTime = newTime;
        var progressUpdated = this.lastTime / this.duration;
        this.progressPercent = parseFloat((progressUpdated * 100).toFixed(3));
        this.progressPixel = parseFloat((this.__sliderWidth * progressUpdated).toFixed(3));
        this.__videoElement.currentTime = this.lastTime;
        this.__didCompletedWatching();
    }

    __checkIsMuted() {
        return this.__videoVolume === 0;
    }

    __updateLastBuffer() {
        var buffered = this.__videoElement.buffered;
        if (this.__videoElement && buffered && buffered.length > 0) {
            this.__buffered.lastTime = buffered.length > 2 ? buffered.end(buffered.length - 2) : buffered.end(0);
            if (this.duration > 0) {
                this.__buffered.lastTime = this.__updateLastTime(this.__buffered.lastTime);
                var percentValue = this.__buffered.lastTime / this.duration;
                this.__buffered.progressPercent = this.__updateProgressPercentValue(parseFloat(percentValue.toFixed(3)) * 100);
                this.__buffered.progressPixel = this.__updateProgressPixelValue(parseFloat((this.__sliderWidth * percentValue).toFixed(3)));
                this.__buffered.cb && this.__buffered.cb();
            }
        }
    }

    __updateLastTime(newTime) {
        if (newTime < this.duration) {
            return newTime;
        } else if (newTime < 0) {
            return 0;
        } else {
            return this.duration;
        }
    }

    __updateProgressPercentValue(newPercent) {
        if (newPercent < 100) {
            return newPercent;
        } else if (newPercent <= 0) {
            return 0;
        } else {
            return 100;
        }
    }

    __updateProgressPixelValue(newPixel) {
        if (newPixel < this.__sliderWidth) {
            return newPixel;
        } else if (newPixel <= 0) {
            return 0;
        } else {
            return this.__sliderWidth;
        }
    }

    __didCompletedWatching() {
        if (this.lastTime === this.duration) {
            this.completedWatching = true;
            this.isPlaying = false;
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
        }
    }

    skipFwd() {
        this.__calculateSkipProgress(this.lastTime + this.__skipOffset);
    }

    skipBwd() {
        this.__calculateSkipProgress(this.lastTime - this.__skipOffset);
    }

    increaseVol() {
        this.volume += this.__volumeOffset;
        this.__videoElement.volume = this.volume;
    }

    decreaseVol() {
        this.volume -= this.__volumeOffset;
        this.__videoElement.volume = this.volume;
    }

    __initializeVideoPlaybackEvents() {
        this.__videoElement.addEventListener("timeupdate", this.__updateProgress);
        this.__videoElement.addEventListener("progress", this.__updateLastBuffer);
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
        this.__videoElement.removeEventListener("progress", this.__updateLastBuffer);
    }
}