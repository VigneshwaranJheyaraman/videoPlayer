class VrajPlayer extends Player {
    constructor(properties) {
        super(properties);
        this.__playerElement = properties.video;
        this.__slider = {
            self: properties.slider,
            seeker: properties.slider.querySelector("#seeker"),
            progress: properties.slider.querySelector("#progress"),
            buffered: properties.slider.querySelector("#buffer"),
        };
        this.__detailsComponent = this.__playerContainer.querySelector("#details");
        this.__thumbURL = null;
        this.__mediaController = null;
        this.__thumbnailComponent = null;
        this.__controls = {
            play: properties.controls.querySelector("#playBtn"),
            pause: properties.controls.querySelector("#pauseBtn"),
            stop: properties.controls.querySelector("#stopBtn"),
            ffwd: properties.controls.querySelector("#fwBtn"),
            bbwd: properties.controls.querySelector("#bwBtn"),
            fullScreen: properties.controls.querySelector("#fullScreen"),
            cc: properties.controls.querySelector("#ccBtn")
        };
        this.__overlayControls = {
            self: properties.overlay,
            play: properties.overlay.querySelector(".fa-play"),
            pause: properties.overlay.querySelector(".fa-pause"),
            repeat: properties.overlay.querySelector('.fa-repeat')
        };
        this.__subtitleComponent = this.__playerContainer.querySelector("#subtitle");
        this.__subtitleEnabled = false;
        this.syncSubtitle = this.syncSubtitle.bind(this);
        this.__subtitleHandler = new SubtitleExtractor({
            video: this.__playerElement,
            url: properties.subtitleURL ? properties.subtitleURL : null,
            subtitleUICallback: this.syncSubtitle
        });
        this.__keyPointers = {
            32: (e) => this.__togglePlayPause(),
            37: (e) => this.jumpBack(e),
            38: (e) => this.__mediaController.increaseVol(),
            39: (e) => this.jumpFront(e),
            40: (e) => this.__mediaController.decreaseVol(),
            83: (e) => this.__toggleSubsComponentDisplay()
        };
        this.__overlayDisplayTimeout = 1e3 * 4;
        this.__overlayTimeout = [];

        this.__updateVideoSource = this.__updateVideoSource.bind(this);
        this.__intializeVideoElementProperties = this.__intializeVideoElementProperties.bind(this);
        this.__initializeMediaController = this.__initializeMediaController.bind(this);
        this.__startDragging = this.__startDragging.bind(this);
        this.__stopDragging = this.__stopDragging.bind(this);
        this.__initEvents = this.__initEvents.bind(this);
        this.__removeEvents = this.__removeEvents.bind(this);
        this.__updateUIProgress = this.__updateUIProgress.bind(this);
        this.__initVideoControlsEvents = this.__initVideoControlsEvents.bind(this);
        this.__removeControlEvents = this.__removeControlEvents.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.stop = this.stop.bind(this);
        this.jumpFront = this.jumpFront.bind(this);
        this.jumpBack = this.jumpBack.bind(this);
        this.__updatePlayerUI = this.__updatePlayerUI.bind(this);
        this.__toggleSubtitle = this.__toggleSubtitle.bind(this);
        this.__initPlayerUI = this.__initPlayerUI.bind(this);
        this.seek = this.seek.bind(this);
        this.jumpTo = this.jumpTo.bind(this);
        this.__toggleSubsComponentDisplay = this.__toggleSubsComponentDisplay.bind(this);
        this.__videoWatchingCompleted = this.__videoWatchingCompleted.bind(this);
        this.__jumpVideoEventHandler = this.__jumpVideoEventHandler.bind(this);
        this.__bufferProgressUI = this.__bufferProgressUI.bind(this);
        this.__initializeThumbnail = this.__initializeThumbnail.bind(this);
        this.__togglePlayPause = this.__togglePlayPause.bind(this);
        this.__handleKeyPress = this.__handleKeyPress.bind(this);
        this.__showDetails = this.__showDetails.bind(this);
        this.__hideDetails = this.__hideDetails.bind(this);
        this.showTimeDetails = this.showTimeDetails.bind(this);
        this.__toggleOverlay = this.__toggleOverlay.bind(this);
        this.showSeekingDetails = this.showSeekingDetails.bind(this);
        this.__calculateHMS = this.__calculateHMS.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
        this.__showError = this.__showError.bind(this);
        this.__hideError = this.__hideError.bind(this);
        this.__enableSeekListeners = this.__enableSeekListeners.bind(this);
        this.__removeSeekListeners = this.__removeSeekListeners.bind(this);
        this.__videoInitializing = this.__videoInitializing.bind(this);
        this.__handleOverlayDisplay = this.__handleOverlayDisplay.bind(this);
        this.__clearOverlayTimeout = this.__clearOverlayTimeout.bind(this);
        this.__showOverlay = this.__showOverlay.bind(this);
        this.__hideOverlay = this.__hideOverlay.bind(this);
        this.__disableSubtitle = this.__disableSubtitle.bind(this);
        this.updateSrc = this.updateSrc.bind(this);
        this.thumbURL = properties.thumbURL;
        this.__disableSubtitle(properties.subtitleURL && properties.subtitleURL.length);
        this.__intializeVideoElementProperties();
        this.__updateVideoSource();
        this.subscribe();
    }

    updateSrc(newSrc) {
        super.src = newSrc;
        this.__mediaController && this.__mediaController.initProps();
        this.__mediaController && this.__updateUIProgress();
        this.__updateVideoSource();
        this.__initPlayerUI();
    }

    get thumbURL() {
        return this.__thumbURL;
    }

    set thumbURL(thumbURL) {
        if (thumbURL && thumbURL.length) {
            this.__thumbURL = thumbURL;
            this.__initializeThumbnail();
        }
    }

    get subtitleURL() {
        return (this.__subtitleHandler && this.__subtitleHandler.url) || undefined;
    }

    set subtitleURL(subtitleURL) {
        if (this.__subtitleHandler) {
            if (subtitleURL && subtitleURL.length) {
                this.__subtitleHandler.url = subtitleURL;
                this.__subtitleEnabled = false;
                this.__disableSubtitle(true);
            }
        }
    }

    __disableSubtitle(subtitleAvailable = false) {
        if (!subtitleAvailable) {
            this.__controls.cc && this.__controls.cc.classList.add("disabled");
        } else {
            this.__controls.cc && this.__controls.cc.classList.remove("disabled");
        }
    }

    __updateVideoSource() {
        var sourceList = this.__playerElement.querySelectorAll("source");
        sourceList && Object.assign([], sourceList).forEach(source => {
            source.src = this.src;
        });
        this.__playerElement && this.__playerElement.load();
    }

    __intializeVideoElementProperties() {
        if (this.videoPlayable) {
            this.__playerElement.controls = false;
            this.__videoInitializing();
        }
        this.__toggleSubsComponentDisplay();
        this.__initializeThumbnail();
    }

    subscribe() {
        super.subscribe();
        this.__initEvents();
    }

    unsubscribe() {
        super.unsubscribe();
        this.__removeEvents();
    }

    __initEvents() {
        this.__playerElement.addEventListener("loadedmetadata", () => {
            this.__initializeMediaController();
        });
    }

    __removeEvents() {
        this.__playerElement.removeEventListener("loadedmetadata", () => {
            this.__initializeMediaController();
        });
        this.__removeControlEvents();
    }

    __initializeThumbnail() {
        if (this.__thumbURL) {
            this.__thumbnailComponent = this.__playerContainer.querySelector("#thumbnail");
            this.__thumbnailComponent.style.backgroundImage = `url(${this.__thumbURL})`;
        }
    }

    __initializeMediaController() {
        this.__mediaController = new MediaController({
            videoElement: this.__playerElement,
            sliderWidth: this.__slider.seeker.parentElement.offsetWidth,
            progressCB: this.__updateUIProgress,
            bufferCB: this.__bufferProgressUI
        });
        this.__initVideoControlsEvents();
    }

    __updateUIProgress() {
        this.__slider.seeker.style.left = this.__mediaController.progressPercent;
        if (!this.__mediaController.isSeeking) {
            this.__slider.progress.style.width = this.__mediaController.progressPercent;
        }
    }

    __bufferProgressUI() {
        if (!this.__mediaController.isPlaying || !this.__mediaController.isSeeking || !this.__mediaController.completedWatching) {
            this.__slider.buffered.style.width = this.__mediaController.buffered.progressPercent + "%";
        }
    }

    __handleKeyPress(e) {
        if (e.keyCode) {
            var keyFunc = this.__keyPointers[e.keyCode];
            keyFunc && keyFunc(e);
            this.__toggleOverlay();
        }
    }

    __initPlayerUI() {
        if (this.__playerElement.readyState === this.__playerElement.NETWORK_EMPTY) {
            this.__showError();
        } else {
            this.hideLoading();
            this.__hideError();
            this.__updateUIProgress();
            this.__playerContainer.classList.add("not-started-playing");
        }
    }

    __videoInitializing() {
        if (this.src && this.src.length > 3) {
            var customVideo = document.createElement("video");
            customVideo.addEventListener("error", () => {
                this.__showError();
                customVideo.remove();
            });
            customVideo.addEventListener("load", () => {
                this.__hideError();
                customVideo.remove();
            });
            customVideo.src = this.src;
        }
    }

    __updatePlayerUI() {
        this.__playerContainer.classList.remove("not-started-playing");
        if (this.__mediaController.completedWatching) {
            this.__playerContainer.classList.remove("not-playing");
            this.__playerContainer.classList.remove("playing");
            this.__playerContainer.classList.add("completed");
        } else {
            this.__playerContainer.classList.remove("completed");
            if (this.__mediaController.isPlaying) {
                this.__playerContainer.classList.add("playing");
                this.__playerContainer.classList.remove("not-playing");
            } else {
                this.__playerContainer.classList.add("not-playing");
                this.__playerContainer.classList.remove("playing");
            }
        }
    }

    play() {
        this.__mediaController.play();
        this.__playerElement.playbackRate = this.__mediaController.__constPlayBack;
        this.__hideDetails();
        this.__hideError();
        this.hideLoading();
        this.__updatePlayerUI();
    }

    pause() {
        this.__mediaController.pause();
        this.__updatePlayerUI();
    }

    stop() {
        this.__mediaController.stop();
        this.__updatePlayerUI();
    }

    seek(e) {
        if (this.__mediaController.isSeeking) {
            this.__mediaController.seek(e);
            this.play();
            this.showSeekingDetails();
        }
    }

    jumpBack() {
        this.__mediaController.skipBwd();
        this.__updatePlayerUI();
        this.showSeekingDetails();
        this.play();
    }

    jumpFront() {
        this.__mediaController.skipFwd();
        this.__updatePlayerUI();
        this.showSeekingDetails();
        this.play();
    }

    jumpTo(e) {
        this.__startDragging();
        this.__mediaController.seek(e);
        this.showSeekingDetails();
        this.__stopDragging();
    }

    __togglePlayPause() {
        if (this.__mediaController.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    __toggleSubsComponentDisplay() {
        if (!this.__subtitleEnabled) {
            if (this.__subtitleComponent) { this.__subtitleComponent.style.display = "none"; }
        } else {
            if (this.__subtitleComponent) { this.__subtitleComponent.style.display = "block"; }
        }
    }

    __toggleSubtitle() {
        const subtitleClass = "toggled";
        this.__subtitleEnabled = !this.__subtitleEnabled;
        if (this.__subtitleEnabled) {
            this.__controls.cc.classList.add(subtitleClass);
            this.__toggleSubsComponentDisplay();
        } else {
            this.__controls.cc.classList.remove(subtitleClass);
            this.__toggleSubsComponentDisplay();
        }
    }

    __enableSeekListeners() {
        if (!this.isPDA) {
            this.__slider.seeker.addEventListener("mousedown", this.__startDragging);
            this.__slider.seeker.addEventListener("mouseup", this.__stopDragging);
            this.__playerContainer.addEventListener("mouseup", this.__stopDragging);
            this.__playerContainer.addEventListener("mousemove", this.seek);
            this.__playerContainer.addEventListener("mousemove", this.__handleOverlayDisplay);
            this.__playerContainer.addEventListener("mouseout", this.__hideOverlay);
        } else {
            this.__slider.seeker.addEventListener("touchstart", this.__startDragging);
            this.__slider.seeker.addEventListener("touchend", this.__stopDragging);
            this.__playerContainer.addEventListener("touchend", this.__stopDragging);
            this.__playerContainer.addEventListener("touchcancel", this.__stopDragging);
            this.__playerContainer.addEventListener("touchmove", this.seek);
            this.__playerContainer.addEventListener("touchmove", this.__handleOverlayDisplay);
        }
    }

    __removeSeekListeners() {
        if (!this.isPDA) {
            this.__slider.seeker.removeEventListener("mousedown", this.__startDragging);
            this.__slider.seeker.removeEventListener("mouseup", this.__stopDragging);
            this.__playerContainer.removeEventListener("mouseup", this.__stopDragging);
            this.__playerContainer.removeEventListener("mousemove", this.seek);
            this.__playerContainer.removeEventListener("mouseout", this.__hideOverlay);
        } else {
            this.__slider.seeker.removeEventListener("touchstart", this.__startDragging);
            this.__slider.seeker.removeEventListener("touchend", this.__stopDragging);
            this.__playerContainer.removeEventListener("touchend", this.__stopDragging);
            this.__playerContainer.removeEventListener("touchcancel", this.__stopDragging);
            this.__playerContainer.removeEventListener("touchmove", this.seek);
        }
    }

    syncSubtitle() {
        if (this.__subtitleHandler && this.__subtitleComponent) {
            if (this.__subtitleHandler.__videoSynchronizer && this.__subtitleHandler.__videoSynchronizer.currentSub) {
                this.__subtitleComponent.innerText = this.__subtitleHandler.__videoSynchronizer.currentSub;
            }
        }
    }

    __showDetails(details) {
        if (details && details.length > 0) {
            this.__detailsComponent.style.opacity = 1;
            this.__detailsComponent.innerText = details;
        }
    }

    __hideDetails() {
        setTimeout(() => {
            this.__detailsComponent.style.opacity = 0;
        }, 1000);
    }

    __calculateHMS(duration) {
        var sec = duration % (24 * 3600);
        var hr = Math.floor(sec / 3600);
        sec %= 3600
        var min = Math.floor(sec / 60)
        sec %= 60
        sec = parseFloat(sec.toFixed(2));
        return [hr, min, sec];
    }

    showSeekingDetails() {
        if (this.__mediaController) {
            var totalTime = this.__mediaController.duration;
            totalTime = this.__calculateHMS(totalTime);
            var currentTime = this.__mediaController.lastTime;
            currentTime = this.__calculateHMS(currentTime);
            this.__showDetails(`${currentTime[0]}:${currentTime[1]}:${currentTime[2]} / ${totalTime[0]}:${totalTime[1]}:${totalTime[2]}`);
        }
    }

    showTimeDetails() {
        if (this.__detailsComponent) {
            this.__showDetails(`${this.__playerElement.playbackRate}X`);
        } else {
            this.__hideError();
            this.showLoading();
        }
    }

    showLoading() {
        this.__playerContainer.classList.add("loading");
    }

    hideLoading() {
        this.__playerContainer.classList.remove("loading");
    }

    __showError() {
        this.__playerContainer.className = "video-player";
        this.__overlayControls.self.querySelector(".fa-exclamation-triangle").style.opacity = 1;
    }

    __hideError() {
        this.__overlayControls.self.querySelector(".fa-exclamation-triangle").style.opacity = 0;
    }

    __handleOverlayDisplay(e) {
        var query = e.target.id ? e.target.id : Object.assign([], e.target.classList).map(v => "." + v).join(" ");
        this.__toggleOverlay();
        if (this.__playerContainer.querySelector(".features .extras " + query)) {
            this.__clearOverlayTimeout();
        }
    }

    __updateFullScreenState() {
        super.__updateFullScreenState();
        this.__mediaController && this.__mediaController.__updatePositionOffset();
    }

    __clearOverlayTimeout() {
        this.__overlayTimeout.length > 0 && this.__overlayTimeout.forEach(timeout => {
            clearTimeout(timeout);
        });
        this.__overlayTimeout = [];
    }

    __showOverlay() {
        this.__playerContainer.classList.add("show-overlay");
    }

    __hideOverlay() {
        this.__playerContainer.classList.remove("show-overlay");
    }

    __toggleOverlay() {
        this.__showOverlay();
        if (!this.__mediaController.isSeeking) {
            this.__overlayTimeout.push(setTimeout(() => {
                this.__hideOverlay();
            }, this.__overlayDisplayTimeout));
        } else {
            this.__clearOverlayTimeout();
        }
    }

    __initVideoControlsEvents() {
        this.__controls.play.addEventListener("click", this.play);
        this.__controls.pause.addEventListener("click", this.pause);
        this.__controls.stop.addEventListener("click", this.stop);
        this.__controls.ffwd.addEventListener("click", this.__mediaController.fastFwd);
        this.__controls.bbwd.addEventListener("click", this.__mediaController.fastBwd);
        this.__enableSeekListeners();
        this.__overlayControls.play.addEventListener("click", this.play);
        this.__overlayControls.pause.addEventListener("click", this.pause);
        this.__overlayControls.repeat.addEventListener("click", this.play);
        this.__controls.fullScreen.addEventListener("click", this.toggleFullScreen);
        this.__controls.cc.addEventListener("click", this.__toggleSubtitle);
        this.__playerElement.addEventListener("ended", this.__videoWatchingCompleted);
        this.__playerContainer.addEventListener("dblclick", this.__jumpVideoEventHandler);
        this.__playerElement.addEventListener("seeking", this.showSeekingDetails);
        this.__playerElement.addEventListener("ratechange", this.showTimeDetails);
        this.__playerElement.addEventListener("loadeddata", this.__initPlayerUI);
        this.__slider.self.addEventListener("click", this.jumpTo);
        this.__playerElement.addEventListener("error", this.__showError);
        this.__playerElement.addEventListener("stalled", this.__showError);
        this.__playerElement.addEventListener("abort", this.__showError);
        window.addEventListener("keydown", this.__handleKeyPress);
        window.addEventListener("orientationchange", () => {
            this.__mediaController && this.__mediaController.__updatePositionOffset();
        });
    }

    __startDragging() {
        this.__mediaController.isSeeking = true;
        this.__clearOverlayTimeout();
    }

    __stopDragging() {
        this.__mediaController.isSeeking = false;
        this.__playerElement.currentTime = this.__mediaController.lastTime;
        this.play();
    }

    __videoWatchingCompleted() {
        if (this.__mediaController.completedWatching) {
            this.__updatePlayerUI();
        }
    }

    __jumpVideoEventHandler(e) {
        if (this.__playerContainer && this.__mediaController.isPlaying) {
            var containerHalfWay = this.__playerContainer.offsetWidth / 2;
            var wantToSkipBwd = e.pageX < containerHalfWay;
            if (wantToSkipBwd) {
                this.jumpBack();
            } else {
                this.jumpFront();
            }
        }
    }

    __removeControlEvents() {
        this.__controls.play.removeEventListener("click", this.play);
        this.__controls.pause.removeEventListener("click", this.pause);
        this.__controls.stop.removeEventListener("click", this.stop);
        this.__controls.ffwd.removeEventListener("click", this.__mediaController && this.__mediaController.fastFwd);
        this.__controls.bbwd.removeEventListener("click", this.__mediaController && this.__mediaController.fastBwd);
        this.__removeSeekListeners();
        this.__overlayControls.play.removeEventListener("click", this.play);
        this.__overlayControls.pause.removeEventListener("click", this.pause);
        this.__overlayControls.repeat.removeEventListener("click", this.play);
        this.__controls.fullScreen.removeEventListener("click", this.toggleFullScreen);
        this.__controls.cc.removeEventListener("click", this.__toggleSubtitle);
        this.__playerElement.removeEventListener("ended", this.__videoWatchingCompleted);
        this.__slider.self.removeEventListener("click", this.jumpTo);
        this.__playerElement.removeEventListener("seeking", this.showSeekingDetails);
        this.__playerElement.removeEventListener("ratechange", this.showTimeDetails);
        this.__playerElement.removeEventListener("loadeddata", this.__initPlayerUI);
        this.__playerElement.removeEventListener("error", this.__showError);
        this.__playerElement.removeEventListener("stalled", this.__showError);
        this.__playerElement.removeEventListener("abort", this.__showError);
        window.removeEventListener("keydown", this.__handleKeyPress);
        window.removeEventListener("orientationchange", () => {
            this.__mediaController && this.__mediaController.__updatePositionOffset();
        });
    }
}