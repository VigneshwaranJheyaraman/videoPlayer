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
                var id = target.id ? target.id : target.nodeName;
                if (!this.events[id]) this.events[id] = {};
                this.events[id][event] = newEvent;
                EventHandler.prototype.addEventListener(newEvent);
            },
            removeEvent: function(target, event) {
                if (target) {
                    var id = target.id ? target.id : target.nodeName;
                    var tgt = this.events[id];
                    if (tgt && tgt[event]) {
                        tgt.removeEventListener(event, tgt.cb);
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
    EventHandler.prototype.removeEventListener = function(event) {
        var target = events.el,
            cb = events.cb,
            event = events.eve;
        target && target.removeEventListener(event, cb);
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
        };
        var __player = {
                container: null,
                rootElem: document.body,
                playerContainer: null,
                controls: null,
                video: null,
                overlayIcon: null,
                slider: null,
                volumeChanger: null,
                __eventsHandler: EventHandler(),
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

        function updateVideoTime() {
            this.video.currentTime = __player.currentTime;
            player.play();
        }

        function updateVolume(e) {
            if (e.target) {
                console.log(e, e.target);
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
            unsubscribeEvents();
            subscribeEvents();
        }

        function PlayerEvents() {};
        PlayerEvents.prototype.loadVideo = function() {
            __player.duration = __player.video.duration;
            if (__player.volumeChanger) {
                __player.volumeChanger.value = __player.video.volume;
            }
        };
        PlayerEvents.prototype.updateTime = function() {
            if (__player.video.currentTime === __player.duration) {
                stop.call(__player);
            }
            __player.currentTime = __player.video.currentTime;
            updatePlayerSliderUI.call(__player);
        };
        PlayerEvents.prototype.progressVideo = function() {
            updateBufferedTime.call(__player.mediaController, __player.video.buffered);
            __player.slider.__buffer.style.width = `${getBufferWidth.call(__player)}%`;
        };

        function initPlayerEvents(removeEvent = false) {
            function initEvents() {
                __player.eventsHandler.addNewEvent(__player.video, "loadedmetadata", PlayerEvents.prototype.loadVideo);
                __player.eventsHandler.addNewEvent(__player.video, "timeupdate", PlayerEvents.prototype.updateTime);
                __player.eventsHandler.addNewEvent(__player.video, "progress", PlayerEvents.prototype.progressVideo);
            }

            function removeEvents() {
                __player.eventsHandler.removeEvent(__player.video, "loadedmetadata", PlayerEvents.prototype.loadVideo);
                __player.eventsHandler.removeEvent(__player.video, "timeupdate", PlayerEvents.prototype.updateTime);
                __player.eventsHandler.removeEvent(__player.video, "progress", PlayerEvents.prototype.progressVideo);
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
                __player.eventsHandler.addNewEvent(__player.overlayIcon, "click", function() {
                    if (__player.video.paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                });
            }

            function removeEvents() {
                __player.eventsHandler.removeEvent(__player.overlayIcon, "click", function() {
                    if (__player.video.paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                });
            }

            if (__player.overlayIcon) {
                return removeEvent ? removeEvents : initEvents;
            }
        }

        //Unsubscribe all events
        function unsubscribeEvents() {
            window.addEventListener("unload", function() {
                initPlayerEvents(true)();
                initControlsEvents(true)();
                initOverlayEvents(true)();
            });
        }

        //Subscribe all events
        function subscribeEvents() {
            initPlayerEvents()();
            initControlsEvents()();
            initOverlayEvents()();
            __player.slider && __player.slider.__seeker.addEventListener("mousedown", startDragging.bind(__player));
            __player.container && __player.container.addEventListener("mouseup", stopDragging.bind(__player));
            __player.slider && __player.slider.__seeker.addEventListener("mouseup", stopDragging.bind(__player));
            __player.container && __player.container.addEventListener("mousemove", seek.bind(__player));
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