class VrajPlayer extends Player {
    constructor(properties) {
        super(properties);
        this.__playerElement = properties.video;
        this.__slider = {
            seeker: properties.slider.querySelector("#seeker"),
            progress: properties.slider.querySelector("#progress"),
            buffered: properties.slider.querySelector("#buffer"),
        };
        this.__mediaController = null;
        this.__controls = {
            play: properties.controls.querySelector("#playBtn"),
            pause: properties.controls.querySelector("#pauseBtn"),
            stop: properties.controls.querySelector("#stopBtn"),
            ffwd: properties.controls.querySelector("#fwBtn"),
            bbwd: properties.controls.querySelector("#bwBtn"),
            fullScreen: properties.controls.querySelector("#fullScreen")
        };
        this.__overlayControls = {
            play: properties.overlay.querySelector(".fa-play"),
            pause: properties.overlay.querySelector(".fa-pause"),
            repeat: properties.overlay.querySelector('.fa-repeat')
        };
        this.__subtitleEnabled = false;
        this.__subtitleHandler = new SubtitleExtractor({ url: properties.subtitleURL ? properties.subtitleURL : null });

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
        this.__updatePlayerUI = this.__updatePlayerUI.bind(this);
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

    __initializeMediaController() {
        this.__mediaController = new MediaController({
            videoElement: this.__playerElement,
            sliderWidth: this.__slider.seeker.parentElement.offsetWidth,
            progressCB: this.__updateUIProgress
        });
        this.__initVideoControlsEvents();
    }

    __updateUIProgress() {
        this.__slider.seeker.style.left = this.__mediaController.progressPixel;
        if (!this.__mediaController.isSeeking) {
            this.__slider.progress.style.width = this.__mediaController.progressPercent;
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

    __initVideoControlsEvents() {
        this.__controls.play.addEventListener("click", this.play);
        this.__controls.pause.addEventListener("click", this.pause);
        this.__controls.stop.addEventListener("click", this.stop);
        this.__controls.ffwd.addEventListener("click", this.__mediaController.fastFwd);
        this.__controls.bbwd.addEventListener("click", this.__mediaController.fastBwd);
        this.__slider.seeker.addEventListener("mousedown", this.__startDragging);
        this.__slider.seeker.addEventListener("mouseup", this.__stopDragging);
        this.__playerContainer.addEventListener("mouseup", this.__stopDragging);
        this.__playerContainer.addEventListener("mousemove", this.__mediaController.seek);
        this.__overlayControls.play.addEventListener("click", this.play);
        this.__overlayControls.pause.addEventListener("click", this.pause);
        this.__overlayControls.repeat.addEventListener("click", this.play);
        this.__controls.fullScreen.addEventListener("click", this.toggleFullScreen);
        window.addEventListener("blur", this.pause);
        window.addEventListener("focus", this.play);
    }

    __startDragging() {
        this.__mediaController.isSeeking = true;
    }

    __stopDragging() {
        this.__mediaController.isSeeking = false;
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
        this.__playerContainer.removeEventListener("mousemove", this.__mediaController.seek);
        this.__overlayControls.play.removeEventListener("click", this.play);
        this.__overlayControls.pause.removeEventListener("click", this.pause);
        this.__overlayControls.repeat.removeEventListener("click", this.play);
        this.__controls.fullScreen.removeEventListener("click", this.toggleFullScreen);
        window.removeEventListener("blur", this.pause);
        window.removeEventListener("focus", this.play);
    }
}