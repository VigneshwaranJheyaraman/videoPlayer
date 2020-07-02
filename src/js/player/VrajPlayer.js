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
        this.thumbURL = properties.thumbURL;
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
        this.__overlayDisplayTimeout = 1e3 * 3;

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
        this.__intializeVideoElementProperties();
        this.__updateVideoSource();
        this.subscribe();
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
        if (this.thumbURL) {
            this.__thumbnailComponent = this.__playerContainer.querySelector("#thumbnail");
            this.__thumbnailComponent.style.backgroundImage = `url(${this.thumbURL})`;
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
        this.hideLoading();
        this.__playerContainer.classList.add("not-started-playing");
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
        }
    }

    jumpBack() {
        this.__mediaController.skipBwd();
        this.__updatePlayerUI();
    }

    jumpFront() {
        this.__mediaController.skipFwd();
        this.__updatePlayerUI();
    }

    jumpTo(e) {
        this.__startDragging();
        this.__mediaController.seek(e);
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
        if (this.__mediaController && this.__mediaController.isSeeking) {
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
        }
    }

    showLoading() {
        this.__playerContainer.classList.add("loading");
    }

    hideLoading() {
        this.__playerContainer.classList.remove("loading");
    }

    __toggleOverlay() {
        this.__playerContainer.classList.add("show-overlay");
        setTimeout(() => {
            this.__playerContainer.classList.remove("show-overlay");
        }, this.__overlayDisplayTimeout);
    }

    __initVideoControlsEvents() {
        this.__controls.play.addEventListener("click", this.play);
        this.__controls.pause.addEventListener("click", this.pause);
        this.__controls.stop.addEventListener("click", this.stop);
        this.__controls.ffwd.addEventListener("click", this.__mediaController.fastFwd);
        this.__controls.bbwd.addEventListener("click", this.__mediaController.fastBwd);
        this.__slider.seeker.addEventListener("mousedown", this.__startDragging);
        this.__slider.seeker.addEventListener("mouseup", this.__stopDragging);
        this.__playerContainer.addEventListener("mouseup", this.__stopDragging);
        this.__playerContainer.addEventListener("mousemove", this.seek);
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
        window.addEventListener("keydown", this.__handleKeyPress);
    }

    __startDragging() {
        this.__mediaController.isSeeking = true;
    }

    __stopDragging() {
        this.__mediaController.isSeeking = false;
        this.__playerElement.currentTime = this.__mediaController.lastTime;
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
        this.__controls.ffwd.removeEventListener("click", this.__mediaController.fastFwd);
        this.__controls.bbwd.removeEventListener("click", this.__mediaController.fastBwd);
        this.__slider.seeker.removeEventListener("mousedown", this.__startDragging);
        this.__slider.seeker.removeEventListener("mouseup", this.__stopDragging);
        this.__playerContainer.removeEventListener("mouseup", this.__stopDragging);
        this.__playerContainer.removeEventListener("mousemove", this.seek);
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
        window.removeEventListener("keydown", this.__handleKeyPress);
    }
}