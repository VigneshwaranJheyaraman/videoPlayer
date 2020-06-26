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
            bbwd: properties.controls.querySelector("#bwBtn")
        };
        this.__startedSeeking = false;
        this.__updateVideoSource();
        this.__intializeVideoElementProperties();
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
        this.__playerElement.addEventListener("loadedmetadata", () => {
            this.__initializeMediaController();
        });
    }

    unsubscribe() {
        super.unsubscribe();
        this.__playerElement.removeEventListener("loadedmetadata", () => {
            this.__initializeMediaController();
        });
        this.__removeControlsEvents();
    }

    __initializeMediaController() {
        this.__mediaController = new MediaController({
            videoElement: this.__playerElement,
            sliderWidth: this.__slider.seeker.parentElement.offsetWidth,
            progressCB: this.__updateUIProgress.bind(this)
        });
        this.__initVideoControlsEvents();
    }

    __updateUIProgress() {
        this.__slider.seeker.style.left = this.__mediaController.progressPixel;
        this.__slider.progress.style.width = this.__mediaController.progressPercent;
    }

    __initVideoControlsEvents() {
        this.__controls.play.addEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.play.bind(this.__mediaController)));
        this.__controls.pause.addEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.pause.bind(this.__mediaController)));
        this.__controls.stop.addEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.stop.bind(this.__mediaController)));
        this.__controls.ffwd.addEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.fastFwd.bind(this.__mediaController)));
        this.__controls.bbwd.addEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.fastBwd.bind(this.__mediaController)));
        this.__slider.seeker.addEventListener("mousedown", Player.returnThisBoundedFunction((e) => {
            this.__startedSeeking = true;
        }));
        this.__slider.seeker.addEventListener("mouseup", Player.returnThisBoundedFunction((e) => {
            this.__startedSeeking = false;
        }));
        this.__slider.seeker.parentElement.addEventListener("mousemove", Player.returnThisBoundedFunction((e) => {
            if (this.__startedSeeking) {
                this.__mediaController.seek.bind(this.__mediaController)(e);
            }
        }));
    }

    __removeControlEvents() {
        this.__controls.play.removeEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.play.bind(this.__mediaController)));
        this.__controls.pause.removeEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.pause.bind(this.__mediaController)));
        this.__controls.stop.removeEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.stop.bind(this.__mediaController)));
        this.__controls.ffwd.removeEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.fastFwd.bind(this.__mediaController)));
        this.__controls.bbwd.removeEventListener("click", Player.returnThisBoundedFunction(this.__mediaController.fastBwd.bind(this.__mediaController)));
        this.__slider.seeker.removeEventListener("mousedown", Player.returnThisBoundedFunction((e) => {
            this.__startedSeeking = true;
        }));
        this.__slider.seeker.removeEventListener("mouseup", Player.returnThisBoundedFunction((e) => {
            this.__startedSeeking = false;
        }));
        this.__slider.seeker.parentElement.removeEventListener("mousemove", Player.returnThisBoundedFunction((e) => {
            if (this.__startedSeeking) {
                this.__mediaController.seek.bind(this.__mediaController)(e);
            }
        }));
    }
}