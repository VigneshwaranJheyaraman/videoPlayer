(function(moduleExport) {
    return moduleExport(window);
})(function(exportModule) {
    function VideoPlayer(properties) {
        var propsIntializer = (properties = undefined) => {
            return {
                videoLink: properties && properties.movieURL ? properties.movieURL : "",
                rootElement: properties && properties.rootEl ? properties.rootEl : "body",
                thumbnail: properties && properties.thumb ? properties.thumb : "",
                subtitleEnabled: false,
                mediaController: null,
            };
        };
        var __videoPlayer = propsIntializer();
        var __domStatic = {
            id: {},
            class: {
                videoPlayer: ["video-player"],
                    notStarted: "not-started",
                    notPlaying: "not-playing",
                    showVideoOnly: "show-video-only",
                    overlayPlayButton: ["overlay-btn round-btn play-btn"],
                    thumbnail: ["thumbnail"],
                    extras: {
                        self: ["extras"],
                        subContainer: {
                            self: ["subtitle-zone"],
                            cc: ["subtitle"]
                        },
                        sliderContainer: {
                            self: ["video-slider"],
                            seeker: ["seeker"],
                            progress: ["progress"],
                            buffered: ["buffered"]
                        },
                        videoControls: {
                            self: ["controls"],
                            controlsContainer: ["video-controls"],
                            controlIcon: ["overlay-icon fa"],
                            control: "control",
                            active_ctrl: "active-control"
                        }
                    },

            }
        };
        var __domElem = {
            parent: null,
            overlayPlayBtn: null,
            video: null,
            slider: null,
            progress: null,
            buffered: null,
            cc: null,
            controls: {
                play: {
                    elem: null,
                    toggle: false,
                    click: () => {
                        __videoPlayer.mediaController && __videoPlayer.mediaController.play();
                    },
                    class: "fa-play"
                },
                pause: {
                    elem: null,
                    toggle: false,
                    click: () => {
                        __videoPlayer.mediaController && __videoPlayer.mediaController.pause();
                        toggleOverlayPlayBtn(true);
                    },
                    class: "fa-pause"
                },
                stop: {
                    elem: null,
                    toggle: false,
                    click: () => {
                        __videoPlayer.mediaController && __videoPlayer.mediaController.stop();
                    },
                    class: "fa-stop"
                },
                cc: {
                    elem: null,
                    toggle: true,
                    click: () => {},
                    class: "fa-cc"
                },
                download: {
                    elem: null,
                    toggle: false,
                    click: () => {},
                    class: "fa-download"
                },
            }
        };
        var __domUtils = {
            highLightSelectedIcon: function highLightSelectedIcon(selectedIcon) {
                var alreadySelected = document.querySelector(`.${__domStatic.class.extras.videoControls.active_ctrl}`);
                if (alreadySelected) {
                    alreadySelected.classList.remove(__domStatic.class.extras.videoControls.active_ctrl);
                }
                if (selectedIcon.dataset.canToggle === 'true') {
                    if (alreadySelected && selectedIcon.dataset.canToggle === alreadySelected.dataset.canToggle) {
                        __videoPlayer.subtitleEnabled = false;
                        selectedIcon.classList.remove(__domStatic.class.extras.videoControls.active_ctrl);
                    } else {
                        __videoPlayer.subtitleEnabled = true;
                        selectedIcon.classList.add(__domStatic.class.extras.videoControls.active_ctrl);
                    }
                } else {
                    selectedIcon.classList.add(__domStatic.class.extras.videoControls.active_ctrl);
                }
            }
        }

        function initializePlayer() {
            //initialize the player and update the dom elements
            __videoPlayer = propsIntializer(properties);
            var video_player_container = initializePlayerDOM();
            var rootEl = document.querySelector(__videoPlayer.rootElement);
            if (rootEl) {
                rootEl.appendChild(video_player_container);
            }
            __domElem.parent = video_player_container;
            __videoPlayer.mediaController = new MediaPlayer({
                video: __domElem.video,
                progress: __domElem.progress,
                buffered: __domElem.buffered,
                seeker: __domElem.slider,
                controls: Object.keys(__domElem.controls).map(key => {
                    return {
                        [key]: __domElem.controls[key]
                    }
                }),
                slider: document.querySelector(`.${__domStatic.class.extras.sliderContainer.self[0]}`)
            });
            __domElem.video.addEventListener("loadeddata", function() {
                __videoPlayer.mediaController.updateSliderWidth(document.querySelector(`.${__domStatic.class.extras.sliderContainer.self[0]}`).offsetWidth);
            });
            __domElem.video.addEventListener("click", function(event) {
                togglePlaying();
            });
        }

        function toggleOverlayPlayBtn(paused) {
            if (!paused) {
                __domElem.parent.classList.remove(__domStatic.class.notPlaying);
            } else {
                __domElem.parent.classList.add(__domStatic.class.notPlaying);
            }
        }

        function togglePlaying() {

            __videoPlayer.mediaController.togglePlaying();
            toggleOverlayPlayBtn(__domElem.video.paused);
            __domUtils.highLightSelectedIcon(__domElem.video.paused ? __domElem.controls.pause.elem : __domElem.controls.play.elem);
        }

        function initializePlayerDOM() {
            function createPlayerContainer() {
                var playerContainer = document.createElement("div");
                playerContainer.setAttribute("class", __domStatic.class.videoPlayer.join(" "));
                playerContainer.classList.add(__domStatic.class.notStarted);
                __domElem.parent = playerContainer;
                playerContainer.appendChild(createVideo());
                playerContainer.appendChild(createOverlayPlayButton());
                playerContainer.appendChild(createThumbNail());
                playerContainer.appendChild(createExtras());
                return playerContainer;
            }

            function createVideo() {
                var videoElement = document.createElement("video");
                videoElement.setAttribute("type", "video/mp4");
                videoElement.setAttribute("playsinline", "true");
                __domElem.video = videoElement;
                return videoElement;
            }

            function createOverlayPlayButton() {
                var overlayPlayBtn = document.createElement("div");
                overlayPlayBtn.setAttribute("class", __domStatic.class.overlayPlayButton.join(" "));
                overlayPlayBtn.onclick = function(event) {
                    //start video
                    if (!__domElem.video.src) {
                        __domElem.video.src = __videoPlayer.videoLink;
                        __domElem.parent && __domElem.parent.classList.remove(__domStatic.class.notStarted);
                        __domElem.parent && __domElem.parent.classList.add(__domStatic.class.showVideoOnly);
                        __videoPlayer.mediaController && __videoPlayer.mediaController.play();
                        __domUtils.highLightSelectedIcon(__domElem.controls.play.elem);
                    } else {
                        togglePlaying();
                    }
                }
                __domElem.overlayPlayBtn = overlayPlayBtn;
                return overlayPlayBtn;
            }

            function createThumbNail() {
                var thumbnail = document.createElement("div");
                thumbnail.setAttribute("class", __domStatic.class.thumbnail.join(" "));
                thumbnail.style.backgroundImage = `url('${__videoPlayer.thumbnail}')`;
                return thumbnail;
            }

            function createExtras() {
                var extras = document.createElement("div");
                extras.setAttribute("class", __domStatic.class.extras.self.join(" "));

                function createSubtitleZone() {
                    var subtitleZone = document.createElement("div");
                    subtitleZone.setAttribute("class", __domStatic.class.extras.subContainer.self.join(" "));
                    var subtitle = document.createElement("div");
                    subtitle.setAttribute("class", __domStatic.class.extras.subContainer.cc.join(" "));
                    __domElem.cc = subtitle;
                    subtitle.innerText = "Heradoasdomaoifiwenfiwenfinweefnwenfiwenfijnweifnweinfijwenfjwenf";
                    subtitleZone.appendChild(subtitle);
                    return subtitleZone;
                }

                function createVideoSlider() {
                    var videoSliderContainer = document.createElement("div");
                    videoSliderContainer.setAttribute("class", __domStatic.class.extras.sliderContainer.self.join(" "));

                    function createSeeker() {
                        var seeker = document.createElement("div");
                        seeker.setAttribute("class", __domStatic.class.extras.sliderContainer.seeker.join(" "));
                        __domElem.slider = seeker;
                        return seeker;
                    }

                    function createProgressBar() {
                        var progress = document.createElement("div");
                        progress.setAttribute("class", __domStatic.class.extras.sliderContainer.progress.join(" "));
                        __domElem.progress = progress;
                        return progress;
                    }

                    function createBufferBar() {
                        var buffered = document.createElement("div");
                        buffered.setAttribute("class", __domStatic.class.extras.sliderContainer.buffered.join(" "));
                        __domElem.buffered = buffered;
                        return buffered;
                    }
                    videoSliderContainer.appendChild(createSeeker());
                    videoSliderContainer.appendChild(createProgressBar());
                    videoSliderContainer.appendChild(createBufferBar());
                    return videoSliderContainer;
                }

                function createControls() {
                    var controlsContainer = document.createElement("div");
                    controlsContainer.setAttribute("class", __domStatic.class.extras.videoControls.self.join(" "));

                    function createControlIcon(controlObj) {
                        var controlIcon = document.createElement("div");
                        controlIcon.setAttribute("class", __domStatic.class.extras.videoControls.control);
                        controlIcon.dataset.canToggle = controlObj.toggle;
                        controlIcon.onclick = function() {
                            __domUtils.highLightSelectedIcon(controlIcon);
                            controlObj.click();
                        }
                        var icon = document.createElement("i");
                        icon.setAttribute("class", __domStatic.class.extras.videoControls.controlIcon.join(" ") + " " + controlObj.class);
                        controlIcon.appendChild(icon);
                        return controlIcon;
                    }

                    function createVideoControls() {
                        var videoControls = document.createElement("div");
                        videoControls.setAttribute("class", __domStatic.class.extras.videoControls.controlsContainer.join(" "));
                        var video_controls = Object.values(__domElem.controls);
                        video_controls.forEach((control, index) => {
                            if (index !== video_controls.length - 1) {
                                var controlElement = createControlIcon(control);
                                control.elem = controlElement;
                                videoControls.appendChild(controlElement);
                            }
                        });
                        return videoControls;
                    }

                    function createDownloadControls() {
                        var download_button = createControlIcon(__domElem.controls.download);
                        return download_button;
                    }

                    controlsContainer.appendChild(createVideoControls());
                    controlsContainer.appendChild(createDownloadControls());

                    return controlsContainer;
                }

                extras.appendChild(createSubtitleZone());
                extras.appendChild(createVideoSlider());
                extras.appendChild(createControls());
                return extras;
            }

            return createPlayerContainer();
        }

        initializePlayer();
    }

    // delete exportModule.MediaPlayer;

    return exportModule.VideoPlayer = VideoPlayer;
});