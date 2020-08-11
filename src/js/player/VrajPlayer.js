(function(definition) {
    window.Player = {};
    definition(window.Player);
})(function(globalVariable) {

    //Events functions
    function EventHandler() {
        var events = {};
        var eventObject = {
            el: null,
            cb: null,
            eve: null
        };
        var eventHandler = {
            get events() {
                return events;
            },
            set events(newEvent) {
                for (var tgt in events) {
                    for (var eve in events[tgt]) {
                        EventHandler.prototype.removeEventListener(events[tgt][eve]);
                    }
                }
                events = newEvent;
                for (var tgt in events) {
                    for (var eve in events[tgt]) {
                        EventHandler.prototype.addEventListener(events[tgt][eve]);
                    }
                }
            },
            addNewEvent: function(target, event, cb) {
                var newEvent = Object.assign({}, eventObject);
                newEvent.el = target;
                newEvent.cb = cb;
                newEvent.eve = event;
                var id = target.id ? target.id : target.nodeName ? target.nodeName : "window";
                if (!this.events[id]) this.events[id] = {};
                this.events[id][event] = newEvent;
                EventHandler.prototype.addEventListener(newEvent);
            },
            removeEvent: function(target, event) {
                if (target) {
                    var id = target.id ? target.id : target.nodeName ? target.nodeName : "window";
                    var tgt = this.events[id];
                    if (tgt && tgt[event]) {
                        EventHandler.prototype.removeEventListener(tgt[event]);
                        delete this.events[id];
                    }
                }
            }
        };
        return eventHandler;
    }
    EventHandler.prototype.addEventListener = function(events) {
        var target = events.el,
            cb = events.cb,
            event = events.eve;
        target && target.addEventListener(event, cb);
    }
    EventHandler.prototype.removeEventListener = function(events) {
        var target = events.el,
            cb = events.cb,
            event = events.eve;
        target && target.removeEventListener(event, cb);
    }

    //State handler
    function PlayerStorage() {
        const STORAGE_SCHEMA = {
                lastPlayed: 0,
                lastVolume: 1,
            },
            STORAGE_KEY = "pst";
        this.storage = getLocalStorage();
        this.setState = function(newStorage) {
            this.storage = Object.assign({}, this.storage, newStorage);
            setLocalStorage.call(this);
        };
        if (!this.storage) {
            this.setState(Object.assign({}, STORAGE_SCHEMA));
        }

        function setLocalStorage() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage));
        }

        function getLocalStorage() {
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        }
    }

    function VrajPlayer(props) {
        var __mediaController = {
                isDragging: false,
                __currentLeft: null,
                __currentTime: null,
                bufferedTime: null,
                volume: 1,
                offset: {
                    left: 0,
                    top: 0
                },
                get currentLeft() {
                    return this.__currentLeft && parseFloat(this.__currentLeft.toFixed(2));
                },
                set currentLeft(newLeft) {
                    if (__player.slider && __player.slider.offsetWidth) {
                        var wd = __player.slider.offsetWidth;
                        if (newLeft <= 0) {
                            this.__currentLeft = 0 * 100;
                        } else if (newLeft >= wd) {
                            this.__currentLeft = 1 * 100;
                        } else {
                            this.__currentLeft = (newLeft / wd) * 100;
                        }
                    }
                }
            },
            __fullScreenHandler = {
                __isFullScreen: false,
                __canGoFullScreen: true,
                __canPlayVideo: true,
                rootEl: null,
                __mobileWidth: 600,
                booleanize: function(condition) {
                    return !!condition;
                },
                checkFullScreenEnabled: function() {
                    return this.booleanize(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullScreenElement || document.fullscreenElement);
                },
                checkFullScreenPossible: function() {
                    return this.booleanize(document.fullccreenEnabled || document.mozFullScreenEnabled || document.msFullScreenEnabled || document.webkitFullScreenEnabled || document.webkitSupportsFullScreen || document.createElement("video").requestFullScreen);
                },
                checkVideoPlayable: function() {
                    return this.booleanize(document.createElement("video").canPlayType);
                },
                exitFullScreen: function() {
                    this.__isFullScreen = this.checkFullScreenEnabled();
                    if (document && this.__isFullScreen) {
                        try {
                            if (document.exitFullscreen) document.exitFullscreen();
                            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                            else if (document.msExitFullscreen) document.msExitFullscreen();
                            this.updateFullScreenState();
                        } catch (err) {
                            console.error("Error exiting full screen ", err);
                        }
                    }
                },
                goFullScreen: function() {
                    this.__isFullScreen = this.checkFullScreenEnabled();
                    if (this.rootEl && !this.__isFullScreen) {
                        try {
                            if (this.rootEl.requestFullscreen) this.rootEl.requestFullscreen();
                            else if (this.rootEl.mozRequestFullScreen) this.rootEl.mozRequestFullScreen();
                            else if (this.rootEl.webkitRequestFullScreen) this.rootEl.webkitRequestFullScreen();
                            else if (this.rootEl.msRequestFullscreen) this.rootEl.msRequestFullscreen();
                            this.updateFullScreenState();
                        } catch (err) {
                            console.error("Error going full screen", err);
                        }
                    }
                },
                isMobile: function() {
                    return this.rootEl && this.rootEl.offsetWidth <= this.__mobileWidth;
                },
                toggleFullScreen: function() {
                    if (this.__isFullScreen) {
                        this.exitFullScreen();
                    } else {
                        this.goFullScreen();
                    }
                    this.__isFullScreen = !this.__isFullScreen;
                },
                updateFullScreenState: function() {
                    const FULL_SCREEN_ATTR = "fs",
                        FULL_SCREEN_VALUES = {
                            fullScreen: "FS",
                            notFullScreen: "NFS"
                        };
                    if (this.__isFullScreen) {
                        this.rootEl.setAttribute(FULL_SCREEN_ATTR, FULL_SCREEN_VALUES.fullScreen);
                    } else {
                        this.rootEl.setAttribute(FULL_SCREEN_ATTR, FULL_SCREEN_VALUES.notFullScreen);
                    }
                },
                init: function(container) {
                    this.__isFullScreen = this.checkFullScreenEnabled();
                    this.__canGoFullScreen = this.checkFullScreenPossible();
                    this.__canPlayVideo = this.checkVideoPlayable();
                    this.rootEl = container;
                    var ctx = Object.assign({}, this);
                    return {
                        get isFullScreen() {
                            return ctx.__isFullScreen;
                        },
                        get isMobile() {
                            return ctx.isMobile.call(ctx);
                        },
                        get fullScreenPossible() {
                            return ctx.__canGoFullScreen;
                        },
                        get videoPlayable() {
                            return ctx.__canPlayVideo;
                        },
                        toggleFullScreen: ctx.toggleFullScreen.bind(ctx),
                    };
                }
            },
            __player = {
                container: null,
                rootElem: document.body,
                playerContainer: null,
                controls: null,
                video: null,
                overlayIcon: null,
                slider: null,
                captions: null,
                volumeChanger: null,
                __eventsHandler: EventHandler(),
                storageHandler: new PlayerStorage(),
                subtitleHandler: null,
                fullScreenHandler: null,
                duration: null,
                get currentTime() {
                    return this.__currentTime
                },
                set currentTime(time) {
                    if (this.duration) {
                        if (time <= 0) {
                            this.__currentTime = 0;
                        } else if (time >= this.duration) {
                            this.__currentTime = this.duration;
                        } else {
                            this.__currentTime = time;
                        }
                    }
                },
                get mediaController() {
                    return __mediaController;
                },
                get eventsHandler() {
                    return this.__eventsHandler;
                }
            },
            __subtitleHandler = {
                subtitleResponse: null,
                subtitleDictionary: {},
                url: null,
                subtitleOrganizer: null,
                subtitleRegex: {
                    newLine: "\n",
                    everyNewSubtitle: /^\s*$/,
                    subtitleCount: /^[0-9]{1,5}\s*$/,
                    fromToTime: /(([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5})\s*(-->)\s*(([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5})/,
                    time: /([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5}/,
                    nextSubPointer: "<=>",
                    fromToSplitter: /\s*(-->)\s*/,
                    fromToPointer: "="
                },
                convertToSeconds: function(time) {
                    return (time.hour * 60 * 60) + (time.min * 60) + (time.sec) + (time.microSec / 1000)
                },
                extrasHMSMS: function(timeString) {
                    var timeFormat = /([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5}/;
                    if (timeFormat.test(timeString)) {
                        var timeSplitted = timeString.split(":");
                        var hour = parseInt(timeSplitted[0], 10);
                        var min = parseInt(timeSplitted[1], 10);
                        var sec = parseInt(timeSplitted[2].split(",")[0], 10);
                        var microSec = parseInt(timeSplitted[2].split(",")[1], 10);
                        return {
                            hour,
                            min,
                            sec,
                            microSec
                        };
                    }
                },
                fetchSubtitle: function() {
                    if (this.url) {
                        fetch(this.url, {
                            method: "GET"
                        }).then(response => {
                            if (/20[0-9]/.test(response.status)) {
                                //successfull response
                                return response.text();
                            } else {
                                throw new Error("No response from the specified URL " + this.url);
                            }
                        }).then(textResponse => {
                            this.subtitleResponse = textResponse;
                            this.subtitleResponseParser();
                            this.updateSynchronizerDB();
                        }).catch(err => {
                            console.log(err);
                            throw new Error("Error processing the request " + err);
                        });
                    }
                },
                updateSynchronizerDB: function() {
                    if (JSON.stringify(this.subtitleDictionary) !== JSON.stringify({})) {
                        this.subtitleOrganizer.subtitleDictionary = this.subtitleDictionary;
                    }
                },
                subtitleResponseParser: function() {
                    this.subtitleDictionary = {};
                    if (this.subtitleResponse) {
                        var onlySubtitlesInfoList = this.subtitleResponse.split(this.subtitleRegex.newLine);
                        onlySubtitlesInfoList = onlySubtitlesInfoList.map(line => line.replace(this.subtitleRegex.everyNewSubtitle, this.subtitleRegex.nextSubPointer));
                        onlySubtitlesInfoList = onlySubtitlesInfoList.filter(line => !this.subtitleRegex.subtitleCount.test(line));
                        var lastTimeInterval = null;
                        for (var i = 0; i < onlySubtitlesInfoList.length; i++) {
                            var currentInfo = onlySubtitlesInfoList[i];
                            if (currentInfo !== this.subtitleRegex.nextSubPointer) {
                                if (this.subtitleRegex.fromToTime.test(currentInfo)) {
                                    var fromtoTimeString = currentInfo.replace(this.subtitleRegex.fromToSplitter, this.subtitleRegex.fromToPointer).split(this.subtitleRegex.fromToPointer);
                                    var fromTime = this.convertToSeconds(this.extrasHMSMS(fromtoTimeString[0])),
                                        toTime = this.convertToSeconds(this.extrasHMSMS(fromtoTimeString[1]));
                                    this.subtitleDictionary[fromTime] = { to: toTime, subtitle: '' };
                                    lastTimeInterval = fromTime;
                                } else {
                                    this.subtitleDictionary[lastTimeInterval].subtitle += currentInfo;
                                }
                            }
                        }
                    }
                },
                init: function(props) {
                    this.url = props.url;
                    this.fetchSubtitle();
                    this.subtitleOrganizer = __synchronizer.init({
                        video: props.video,
                        db: this.subtitleDictionary,
                        uiCB: props.uiCB
                    });
                    return this.subtitleOrganizer;
                }
            },
            __synchronizer = {
                video: null,
                subtitleDictionary: null,
                currentSubtitle: '',
                currentTime: 0,
                subtitleUICallback: null,
                findSubtitleFromTime: function() {
                    if (this.subtitleDictionary) {
                        var currentTime = parseFloat(this.currentTime.toFixed(2));
                        Object.keys(this.subtitleDictionary).forEach(key => {
                            key = parseFloat(key);
                            if ((currentTime - key) < 1 && (currentTime - key) >= 0) {
                                if (currentTime < this.subtitleDictionary[key].to) {
                                    this.currentSubtitle = this.subtitleDictionary[key].subtitle;
                                }
                                return;
                            }
                        });
                    }
                },
                init: function(props) {
                    this.subtitleDictionary = props.db;
                    this.video = props.video;
                    this.subtitleUICallback = props.uiCB;
                    this.subscribeEvents();
                    window.addEventListener("unload", this.unsubscribeEvents);
                    var ctx = this;
                    return {
                        get currentSubtitle() {
                            return ctx.currentSubtitle;
                        },
                        get subtitleUICallback() {
                            return ctx.subtitleUICallback;
                        },
                        set subtitleUICallback(newCB) {
                            if (newCB) {
                                ctx.subtitleUICallback = newCB;
                            }
                        },
                        get subtitleDictionary() {
                            return ctx.subtitleDictionary;
                        },
                        set subtitleDictionary(newDictionary) {
                            if (JSON.stringify(newDictionary) !== JSON.stringify({})) {
                                ctx.subtitleDictionary = newDictionary;
                            }
                        }
                    };
                },
                sync: function() {
                    if (this.video && !this.video.paused) {
                        this.currentTime = this.video.currentTime;
                        this.findSubtitleFromTime();
                        this.subtitleUICallback && this.subtitleUICallback();
                    }
                },
                subscribeEvents: function() {
                    this.video && this.video.addEventListener("timeupdate", this.sync.bind(this));
                },
                unsubscribeEvents: function() {
                    this.video && this.video.removeEventListener("timeupdate", this.sync);
                }
            },
            player = {
                get rootEl() {
                    return Object.assign({}, __player.rootElem);
                },
                set rootEl(rootElementName) {
                    if (rootElementName.length) {
                        var root = document.getElementById(rootElementName);
                        if (root) {
                            __player.rootElem = root;
                            __player.container && __player.container.remove();
                            domInit(props);
                        }
                    }
                },
                get currentTime() {
                    return __player.currentTime;
                },
                play: play.bind(__player),
                pause: pause.bind(__player),
                stop: stop.bind(__player),
                get duration() {
                    return __player.duration;
                },
                get eventsHandler() {
                    return Object.assign({}, __player.eventsHandler);
                },
                get fullScreenHandler() {
                    return Object.assign({}, __player.fullScreenHandler);
                }
            };

        //initialize properties of player
        function propsInit(props) {
            player.rootEl = props.rootElement;
            updatePositionOffset.call(__mediaController);
        }

        //Media controller functions
        function updatePositionOffset() {
            this.offset.left = window.pageXOffset + document.documentElement.clientLeft;
            this.offset.top = window.pageYOffset + document.documentElement.clientTop;
        }
        //Media controller functions ends

        //Player functions

        function getBufferWidth() {
            var buffWidth = (this.mediaController.bufferedTime / this.duration) * 100;
            return parseFloat((buffWidth <= 0 || buffWidth === Infinity ? 0 : buffWidth >= 100 ? 100 : buffWidth).toFixed(2));
        }

        function play() {
            this.container && this.container.play();
            this.video && this.video.play();
        }

        function pause() {
            this.container && this.container.pause();
            this.video && this.video.pause();
        }

        function seek(e) {
            if (e.pageX) {
                if (this.mediaController.isDragging) {
                    this.mediaController.currentLeft = e.pageX - this.mediaController.offset.left;
                    this.currentTime = (this.mediaController.currentLeft / 100) * this.duration;
                    updatePlayerSliderUI.call(this);
                }
            }
        }

        function startDragging() {
            this.mediaController.isDragging = true;
            player.pause();
        }

        function stop() {
            pause.call(this);
            if (this.video) {
                this.video.currentTime = this.duration;
            }
            this.container && this.container.pause();
        }

        function stopDragging() {
            if (this.mediaController.isDragging) {
                this.mediaController.isDragging = false;
                updateVideoTime.call(this);
            }
        }

        function updateBufferedTime(buffer) {
            if (buffer.length) {
                this.bufferedTime = buffer.end(buffer.length - 1);
            }
        }

        function updateCaptionsUI() {
            if (this.captions && this.subtitleHandler) {
                this.captions.innerHTML = this.subtitleHandler.currentSubtitle;
            }
        }

        function updateVideoTime() {
            this.video.currentTime = __player.currentTime;
            player.play();
        }

        function updateVolume(e) {
            if (e.target) {
                this.mediaController.volume = e.target.value;
                this.video.volume = this.mediaController.volume;
            }
        }

        function updatePlayerSliderUI() {
            if (this.slider) {
                this.mediaController.currentLeft = (this.currentTime / this.duration) * this.slider.offsetWidth;
                this.slider.__seeker.style.left = `calc(${this.mediaController.currentLeft}% - ${this.slider.__seeker.offsetWidth/2}px)`;
                this.slider.__progress.style.width = `${this.mediaController.currentLeft}%`;
            }
        }
        //Player functions ends here

        // intialize dom for the player
        function domInit(props) {
            var vrajPlayer = document.createElement("vraj-player");
            if (props.thumbnail) {
                vrajPlayer.setAttribute("thumbnail", props.thumbnail);
                vrajPlayer.setAttribute("prc", props.video);
            }
            __player.container = vrajPlayer;
            __player.rootElem && __player.rootElem.append(vrajPlayer);
            __player.playerContainer = vrajPlayer.playerContainer;
            __player.overlayIcon = vrajPlayer.playerOverlayIcon;
            __player.controls = vrajPlayer.controls();
            __player.video = vrajPlayer.video;
            __player.slider = vrajPlayer.slider;
            __player.volumeChanger = vrajPlayer.volumeSlider;
            __player.captions = vrajPlayer.captions;
            __player.fullScreenHandler = __fullScreenHandler.init(__player.playerContainer);
            __player.subtitleHandler = __subtitleHandler.init({
                video: __player.video,
                url: props.subtitleURL,
                uiCB: updateCaptionsUI.bind(__player)
            });
            subscribeEvents();
            window.addEventListener("unload", unsubscribeEvents);
        }

        function PlayerEvents() {};
        PlayerEvents.prototype.loadVideo = function() {
            this.duration = this.video.duration;
            if (this.volumeChanger) {
                var lastVolume = this.storageHandler.storage.lastVolume;
                this.volumeChanger.value = lastVolume;
                this.video.volume = lastVolume;
            }
            if (this.video) {
                var lastPlayed = this.storageHandler.storage.lastPlayed;
                this.video.currentTime = lastPlayed;
                this.currentTime = lastPlayed;
            }
        };
        PlayerEvents.prototype.updateTime = function() {
            if (this.video.currentTime === this.duration) {
                stop.call(this);
            }
            this.currentTime = this.video.currentTime;
            updatePlayerSliderUI.call(this);
        };
        PlayerEvents.prototype.progressVideo = function() {
            updateBufferedTime.call(this.mediaController, this.video.buffered);
            this.slider.__buffer.style.width = `${getBufferWidth.call(this)}%`;
        };
        PlayerEvents.prototype.videoWaiting = function() {
            if (this.video.readyState < 2) {
                this.container.loading();
            }
        };
        PlayerEvents.prototype.onPlaying = function() {
            if (!this.video.paused) {
                this.container.play();
            }
        };
        PlayerEvents.prototype.toggleFullScreen = function() {
            this.fullScreenHandler.toggleFullScreen();
            this.container.toggleFullScreen(this.fullScreenHandler.isFullScreen);
        };
        PlayerEvents.prototype.togglePlayPause = function() {
            if (this.video.paused) {
                player.play();
            } else {
                player.pause();
            }
        }

        function initMobileEvents(removeEvent = false) {
            function initEvents() {
                if (__player.playerContainer) {
                    __player.eventsHandler.addNewEvent(__player.playerContainer, "click", PlayerEvents.prototype.togglePlayPause.bind(__player));
                }
            }

            function removeEvents() {
                if (__player.playerContainer) {
                    __player.eventsHandler.removeEvent(__player.playerContainer, "click", PlayerEvents.prototype.togglePlayPause.bind(__player));
                }
            }
            if (__player.playerContainer) {
                return removeEvent ? removeEvents : initEvents;
            }
        }

        function initPlayerEvents(removeEvent = false) {
            function initEvents() {
                __player.eventsHandler.addNewEvent(__player.video, "loadedmetadata", PlayerEvents.prototype.loadVideo.bind(__player));
                __player.eventsHandler.addNewEvent(__player.video, "timeupdate", PlayerEvents.prototype.updateTime.bind(__player));
                __player.eventsHandler.addNewEvent(__player.video, "progress", PlayerEvents.prototype.progressVideo.bind(__player));
                __player.eventsHandler.addNewEvent(__player.video, "waiting", PlayerEvents.prototype.videoWaiting.bind(__player));
                __player.eventsHandler.addNewEvent(__player.video, "playing", PlayerEvents.prototype.onPlaying.bind(__player));
            }

            function removeEvents() {
                __player.eventsHandler.removeEvent(__player.video, "loadedmetadata", PlayerEvents.prototype.loadVideo.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "timeupdate", PlayerEvents.prototype.updateTime.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "progress", PlayerEvents.prototype.progressVideo.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "waiting", PlayerEvents.prototype.videoWaiting.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "playing", PlayerEvents.prototype.onPlaying.bind(__player));
            }
            if (__player.video) {
                return removeEvent ? removeEvents : initEvents;
            }
        }

        function initControlsEvents(removeEvent = false) {
            function initEvents() {
                Object.values(__player.controls).forEach(control => {
                    control = control.elem;
                    if (control.id && control.id.indexOf("play") !== -1) {
                        __player.eventsHandler.addNewEvent(control, "click", player.play);
                    } else if (control.id && control.id.indexOf("pause") !== -1) {
                        __player.eventsHandler.addNewEvent(control, "click", player.pause)
                    } else if (control.id && control.id.indexOf("stop") !== -1) {
                        __player.eventsHandler.addNewEvent(control, "click", player.stop);
                    } else if (control.id && control.id.indexOf("fullScreen") !== -1) {
                        if (__player.fullScreenHandler.fullScreenPossible) {
                            __player.eventsHandler.addNewEvent(control, "click", PlayerEvents.prototype.toggleFullScreen.bind(__player));
                        } else {
                            control.disabled = true;
                        }
                    }
                });
                if (__player.volumeChanger) {
                    __player.eventsHandler.addNewEvent(__player.volumeChanger, "input", updateVolume.bind(__player));
                }
            }

            function removeEvents() {
                Object.values(__player.controls).forEach(control => {
                    control = control.elem;
                    if (control.id && control.id.indexOf("play") !== -1) {
                        __player.eventsHandler.removeEvent(control, "click", player.play);
                    } else if (control.id && control.id.indexOf("pause") !== -1) {
                        __player.eventsHandler.removeEvent(control, "click", player.pause)
                    } else if (control.id && control.id.indexOf("stop") !== -1) {
                        __player.eventsHandler.removeEvent(control, "click", player.stop);
                    } else if (control.id && control.id.indexOf("fullScreen") !== -1) {
                        if (__player.fullScreenHandler.fullScreenPossible) {
                            __player.eventsHandler.addNewEvent(control, "click", PlayerEvents.prototype.toggleFullScreen.bind(__player));
                        } else {
                            control.disabled = true;
                        }
                    }
                });
                if (__player.volumeChanger) {
                    __player.eventsHandler.removeEvent(__player.volumeChanger, "input", updateVolume.bind(__player));
                }
            }
            if (__player.controls) {
                return !removeEvent ? initEvents : removeEvents;
            }
        }

        function initOverlayEvents(removeEvent = false) {
            function initEvents() {
                __player.eventsHandler.addNewEvent(__player.overlayIcon, "click", PlayerEvents.prototype.togglePlayPause.bind(__player));
            }

            function removeEvents() {
                __player.eventsHandler.removeEvent(__player.overlayIcon, "click", PlayerEvents.prototype.togglePlayPause.bind(__player));
            }

            if (__player.overlayIcon) {
                return removeEvent ? removeEvents : initEvents;
            }
        }

        function initSeekingEvents(removeEvent = false) {
            function initEvents() {
                __player.eventsHandler.addNewEvent(__player.slider.__seeker, "mousedown", startDragging.bind(__player));
                __player.eventsHandler.addNewEvent(__player.slider.__seeker, "mouseup", stopDragging.bind(__player));
                __player.eventsHandler.addNewEvent(__player.container, "mouseup", stopDragging.bind(__player));
                __player.eventsHandler.addNewEvent(__player.container, "mousemove", seek.bind(__player));
                __player.eventsHandler.addNewEvent(window, "mouseup", stopDragging.bind(__player));
            }

            function removeEvents() {
                __player.eventsHandler.removeEvent(__player.slider.__seeker, "mousedown", startDragging.bind(__player));
                __player.eventsHandler.removeEvent(__player.slider.__seeker, "mouseup", stopDragging.bind(__player));
                __player.eventsHandler.removeEvent(__player.container, "mouseup", stopDragging.bind(__player));
                __player.eventsHandler.removeEvent(__player.container, "mousemove", seek.bind(__player));
                __player.eventsHandler.removeEvent(window, "mouseup", stopDragging.bind(__player));
            }

            if (__player.slider && __player.container) {
                return removeEvent ? removeEvents : initEvents;
            }
        }

        //Unsubscribe all events
        function unsubscribeEvents() {
            initPlayerEvents(true)();
            initControlsEvents(true)();
            initOverlayEvents(true)();
            initSeekingEvents(true)();
            if (__player.fullScreenHandler.isMobile) {
                initMobileEvents(true)();
            }
            window.removeEventListener("resize", function() {
                if (window.outerWidth <= __fullScreenHandler.__mobileWidth) {
                    initMobileEvents()();
                } else {
                    initMobileEvents(true)();
                }
            });
            __player.storageHandler.setState({
                lastPlayed: __player.currentTime !== __player.duration ? __player.currentTime : 0,
                lastVolume: __player.video.volume
            });
        }

        //Subscribe all events
        function subscribeEvents() {
            initPlayerEvents()();
            initControlsEvents()();
            initOverlayEvents()();
            initSeekingEvents()();
            if (__player.fullScreenHandler.isMobile) {
                initMobileEvents()();
            }
            window.addEventListener("resize", function() {
                if (window.innerWidth <= __fullScreenHandler.__mobileWidth) {
                    initMobileEvents()();
                } else {
                    initMobileEvents(true)();
                }
            });
        }

        function init() {
            propsInit(props);
        }

        //initialize the vrajplayer
        init();
        return player;
    };

    globalVariable.VrajPlayer = VrajPlayer;
});