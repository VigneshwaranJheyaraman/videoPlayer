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
            const STORAGE = {},
                STORAGE_KEY = "pst";
            this.storage = getLocalStorage();
            this.setState = function(newStorage) {
                this.storage = Object.assign({}, this.storage, newStorage);
                setLocalStorage.call(this);
            };
            if (!this.storage) {
                this.setState(Object.assign({}, STORAGE));
            }

            function setLocalStorage() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage));
            }

            function getLocalStorage() {
                return JSON.parse(localStorage.getItem(STORAGE_KEY));
            }
        }

        PlayerStorage.prototype.STORAGE_SCHEMA = Object.assign({}, {
            lastPlayed: 0,
            lastVolume: 1,
        });

        PlayerStorage.prototype.generateVideoID = function(url) {
            return btoa(url);
        }

        function VrajPlayer(props) {
            var __mediaController = {
                    isDragging: false,
                    __currentLeft: null,
                    __currentTime: 0,
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
                        return this.booleanize(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullScreenEnabled || document.webkitFullScreenEnabled || document.webkitSupportsFullScreen || document.createElement("video").requestFullScreen);
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
                            } catch (err) {
                                console.error("Error going full screen", err);
                            }
                        }
                    },
                    isMobile: function() {
                        let check = false;
                        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
                        return check;
                    },
                    toggleFullScreen: function() {
                        if (this.__isFullScreen) {
                            this.exitFullScreen();
                        } else {
                            this.goFullScreen();
                        }
                        this.__isFullScreen = !this.__isFullScreen;
                        this.updateFullScreenState();
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
                __timeContainer = {
                    duration: null,
                    currentTime: null,
                    generateTimeString: function(timeInS) {
                        if (timeInS) {
                            var minute = Math.floor(timeInS / 60),
                                remaningSec = Math.round(timeInS - (minute * 60)),
                                hr = Math.floor(minute / 60);
                            if (minute >= 60) {
                                hr += 1;
                                minute = 0;
                            }
                            return { hr, minute, sec: remaningSec };
                        } else { return { hr: 0, minute: 0, sec: 0 } }
                    },
                    parseToTimeString: function({ hr, minute, sec }) {
                        minute = minute < 10 ? "0" + minute : minute;
                        sec = sec < 10 ? "0" + sec : sec;
                        return hr > 0 ? (hr < 10 ? "0" + hr : hr + ":" + minute + ":" + sec) : minute + ":" + sec;
                    },
                    generateRunningTime: function() {
                        return (
                            this.parseToTimeString(this.generateTimeString(this.currentTime)) +
                            "/" +
                            this.parseToTimeString(this.generateTimeString(this.duration))
                        );
                    },
                    init: function(props) {
                        this.currentTime = props.currentTime ? props.currentTime : 0;
                        this.duration = props.duration;
                        var ctx = this;
                        return {
                            get stringify() {
                                return ctx.generateRunningTime.call(ctx);
                            },
                            get time() {
                                return ctx.generateTimeString.call(ctx, ctx.currentTime);
                            },
                            get totalTime() {
                                return ctx.generateTimeString.call(ctx, ctx.duration);
                            },
                            set time(newTime) {
                                if (newTime) {
                                    ctx.currentTime = newTime;
                                }
                            }
                        }
                    }
                },
                __gestureHandler = {
                    rootEl: null,
                    eventHandler: EventHandler(),
                    startPos: {
                        x: 0,
                        y: 0
                    },
                    distance: {
                        x: 0,
                        y: 0
                    },
                    directionsCB: {
                        left: null,
                        right: null,
                        top: null,
                        bottom: null
                    },
                    swipeDirection: null,
                    thresholdDistance: 150,
                    restraint: 100,
                    maxSwipeTime: Infinity,
                    totalSwipeTime: null,
                    swipeStartTime: null,
                    initTouchPoints: function(eve) {
                        var touchObj = eve.changedTouches && eve.changedTouches.length && eve.changedTouches[0];
                        if (touchObj) {
                            this.swipeDirection = null;
                            this.distance = { x: 0, y: 0 };
                            this.startPos.x = touchObj.pageX;
                            this.startPos.y = touchObj.pageY;
                            this.swipeStartTime = Date.now();
                        }
                    },
                    touchMoveHandler: function(eve) {
                        eve.preventDefault();
                    },
                    touchEndHandler: function(eve) {
                        var touchObj = eve.changedTouches && eve.changedTouches.length && eve.changedTouches[0];
                        if (touchObj) {
                            this.distance.x = touchObj.pageX - this.startPos.x;
                            this.distance.y = touchObj.pageY - this.startPos.y;
                            this.totalSwipeTime = Date.now() - this.swipeStartTime;
                            if (this.totalSwipeTime <= this.maxSwipeTime) {
                                if (
                                    Math.abs(this.distance.x) >= this.thresholdDistance &&
                                    Math.abs(this.distance.y) <= this.restraint
                                ) {
                                    if (this.distance.x < 0) {
                                        this.__directionHandler.left.call(this);
                                    } else {
                                        this.__directionHandler.right.call(this);
                                    }
                                }
                            } else if (
                                Math.abs(this.distance.y) >= this.thresholdDistance &&
                                Math.abs(this.distance.x) <= this.restraint
                            ) {
                                if (this.distance.y < 0) {
                                    this.__directionHandler.top.call(this);
                                } else {
                                    this.__directionHandler.bottom.call(this);
                                }
                            }
                        }
                    },
                    __directionHandler: {
                        left: function() {
                            this.swipeDirection = "L";
                            console.log("left", this.distance.x);
                            this.directionsCB.left && this.directionsCB.left();
                        },
                        right: function() {
                            this.swipeDirection = "R";
                            console.log("right", this.distance.x);
                            this.directionsCB.right && this.directionsCB.right();
                        },
                        top: function() {
                            this.swipeDirection = "T";
                            console.log("up");
                            this.directionsCB.top && this.directionsCB.top();
                        },
                        bottom: function() {
                            this.swipeDirection = "B";
                            console.log("down");
                            this.directionsCB.bottom && this.directionsCB.bottom();
                        }
                    },
                    init: function(props) {
                        this.rootEl = props.rootEl;
                        this.directionsCB = props.directionsCB ? props.directionsCB : this.directionsCB;
                        var ctx = this;
                        return {
                            get x() {
                                return ctx.distance.x;
                            },
                            get y() {
                                return ctx.distance.y;
                            },
                            get directionsCB() {
                                ctx.directionsCB;
                            },
                            set directionsCB(directionsCB) {
                                if (JSON.stringify(directionsCB) !== JSON.stringify({})) {
                                    ctx.directionsCB = directionsCB;
                                }
                            },
                            get events() {
                                return ctx.eventHandler.events;
                            },
                            subscribe: function() {
                                if (this.rootEl) {
                                    this.eventHandler.addNewEvent(this.rootEl, "touchstart", this.initTouchPoints.bind(this));
                                    this.eventHandler.addNewEvent(this.rootEl, "touchmove", this.touchMoveHandler.bind(this));
                                    this.eventHandler.addNewEvent(this.rootEl, "touchend", this.touchEndHandler.bind(this));
                                }
                            }.bind(ctx),
                            unsubscribe: function() {
                                if (this.rootEl) {
                                    this.eventHandler.removeEvent(this.rootEl, "touchstart", this.initTouchPoints.bind(this));
                                    this.eventHandler.removeEvent(this.rootEl, "touchmove", this.touchMoveHandler.bind(this));
                                    this.eventHandler.removeEvent(this.rootEl, "touchend", this.touchEndHandler.bind(this));
                                }
                            }.bind(ctx)
                        };
                    }
                },
                __player = {
                    container: null,
                    rootElem: document.body,
                    playerContainer: null,
                    playerId: null,
                    controls: null,
                    video: null,
                    audio: null,
                    overlayIcon: null,
                    slider: null,
                    captions: null,
                    volumeChanger: null,
                    timeHandler: null,
                    timeContainer: null,
                    __eventsHandler: EventHandler(),
                    storageHandler: new PlayerStorage(),
                    guesterHandler: null,
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
                    fetchSubtitle: function(cb = {}) {
                        if (this.url) {
                            fetch(this.url, {
                                method: "GET"
                            }).then(response => {
                                if (/20[0-9]/.test(response.status)) {
                                    //successfull response
                                    cb.s && cb.s();
                                    return response.text();
                                } else {
                                    cb.f && cb.f();
                                    throw new Error("No response from the specified URL " + this.url);
                                }
                            }).then(textResponse => {
                                this.subtitleResponse = textResponse;
                                this.subtitleResponseParser();
                                this.updateSynchronizerDB();
                            }).catch(err => {
                                // console.log(err);
                                cb.f && cb.f();
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
                        this.fetchSubtitle({ s: props.sCB, f: props.fCB });
                        this.subtitleOrganizer = __synchronizer.init({
                            video: props.video,
                            db: this.subtitleDictionary,
                            uiCB: props.uiCB,
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
                    },
                    updateSource: updatePlayerSource.bind(__player)
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

            function enableOrDisableCaption(enableIt = true) {
                var captionBtn = this.controls.filter(ctrl => ctrl.name === "captionsBtn");
                captionBtn = captionBtn.length ? captionBtn[0].elem : null;
                if (enableIt) {
                    this.container.disableTarget(captionBtn, false);
                } else {
                    this.container.disableTarget(captionBtn);
                }
            }

            //Player functions

            function getBufferWidth() {
                var buffWidth = (this.mediaController.bufferedTime / this.duration) * 100;
                return parseFloat((buffWidth <= 0 || buffWidth === Infinity ? 0 : buffWidth >= 100 ? 100 : buffWidth).toFixed(2));
            }

            function isPlaying() {
                return this.currentTime > 0 && !this.video.paused && !this.video.ended && this.video.readyState > 2;
            }

            function play() {
                this.container && this.container.play();
                var playPromise = this.video && this.video.play();
                if (playPromise) {
                    playPromise.then(() => {
                        if (isPlaying.call(this)) {
                            this.audio && this.audio.play();
                        }
                    }).catch(err => {
                        isPlaying.call(this) && pause.call(this);
                    });
                }
            }

            function pause() {
                this.container && this.container.pause();
                var pausePromise = this.video && this.video.pause();
                try {
                    this.audio && this.audio.pause();
                } catch (err) {
                    console.error(err);
                }
            }

            function seek(e) {
                if (e.pageX) {
                    if (this.mediaController.isDragging) {
                        this.mediaController.currentLeft = e.pageX - this.mediaController.offset.left;
                        this.currentTime = (this.mediaController.currentLeft / 100) * this.duration;
                        updateTimeDetails.call(this);
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
                if (this.audio) {
                    this.audio.currentTime = this.duration;
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
                    this.captions.innerText = this.subtitleHandler.currentSubtitle;
                }
            }

            function updatePlayerSource({ video, audio, thumb, subtitle }) {
                PlayerEvents.prototype.videoWaiting.call(this);
                this.playerId = PlayerStorage.prototype.generateVideoID(video);
                this.container.prc = video;
                if (thumb) {
                    this.container.thumb = thumb;
                }
                if (audio) {
                    this.container.arc = audio;
                }
                this.subtitleHandler = __subtitleHandler.init({
                    video: __player.video,
                    url: subtitle,
                    uiCB: updateCaptionsUI.bind(__player)
                });
                this.__mediaController = Object.assign({}, __mediaController, {
                    isDragging: false,
                    __currentLeft: null,
                    __currentTime: 0,
                    bufferedTime: null,
                    volume: 1,
                    offset: {
                        left: 0,
                        top: 0
                    }
                });
            }

            function updateVideoTime() {
                if (this.video) {
                    this.video.currentTime = __player.currentTime;
                }
                if (this.audio) {
                    this.audio.currentTime = __player.currentTime;
                }
                player.play();
            }

            function updateVolume(e) {
                if (e.target) {
                    this.mediaController.volume = e.target.value;
                    this.video.volume = this.mediaController.volume;
                    if (this.audio) {
                        this.audio.volume = this.mediaController.volume;
                    }
                }
            }

            function updatePlayerSliderUI() {
                if (this.slider) {
                    this.mediaController.currentLeft = (this.currentTime / this.duration) * this.slider.offsetWidth;
                    this.slider.__seeker.style.left = `${this.mediaController.currentLeft === 0 ? this.mediaController.currentLeft+'%' : `calc(${this.mediaController.currentLeft}% - ${this.slider.__seeker.offsetWidth/2}px)`}`;
                this.slider.__progress.style.width = `${this.mediaController.currentLeft}%`;
            }
        }

        function updateTimeDetails() {
            if (this.timeContainer) {
                this.timeHandler.time = this.currentTime;
                this.timeContainer.innerHTML = this.timeHandler.stringify;
            }
        }
        //Player functions ends here

        // intialize dom for the player
        function domInit(props) {
            var vrajPlayer = document.createElement("vraj-player");
            if (props.thumbnail) {
                vrajPlayer.setAttribute("thumbnail", props.thumbnail);
            }
            vrajPlayer.setAttribute("prc", props.video);
            vrajPlayer.setAttribute("arc", props.audio);
            __player.playerId =  PlayerStorage.prototype.generateVideoID(props.video);
            __player.container = vrajPlayer;
            __player.rootElem && __player.rootElem.append(vrajPlayer);
            __player.playerContainer = vrajPlayer.playerContainer;
            __player.overlayIcon = vrajPlayer.playerOverlayIcon;
            __player.controls = vrajPlayer.controls();
            __player.video = vrajPlayer.video;
            __player.slider = vrajPlayer.slider;
            __player.volumeChanger = vrajPlayer.volumeSlider;
            __player.captions = vrajPlayer.captions;
            __player.audio = vrajPlayer.audio;
            __player.timeContainer = vrajPlayer.timeContainer;
            __player.fullScreenHandler = __fullScreenHandler.init(__player.playerContainer);
            __player.subtitleHandler = __subtitleHandler.init({
                video: __player.video,
                url: props.subtitleURL,
                uiCB: updateCaptionsUI.bind(__player),
                sCB: enableOrDisableCaption.bind(__player),
                fCB:() => {
                    enableOrDisableCaption.call(__player, false);
                }
            });
            subscribeEvents();
            window.addEventListener("unload", unsubscribeEvents);
        }

        function PlayerEvents() {};
        PlayerEvents.prototype.loadVideo = function() {
            this.duration = this.video.duration;
            var playerStorage = this.storageHandler.storage[this.playerId];
            playerStorage = playerStorage ? playerStorage : PlayerStorage.prototype.STORAGE_SCHEMA;
            //load last loaded time from storage
            if (this.volumeChanger) {
                var lastVolume = playerStorage.lastVolume;
                if (lastVolume) {
                    this.volumeChanger.value = lastVolume;
                    this.video.volume = lastVolume;
                }
            }
            if (this.video) {
                var lastPlayed = playerStorage.lastPlayed;
                if (lastPlayed) {
                    this.video.currentTime = lastPlayed;
                    this.currentTime = lastPlayed;
                    if (this.audio) {
                        this.audio.currentTime = lastPlayed;
                    }
                }
            }
            //time handler to show time data      
            this.timeHandler = __timeContainer.init({
                duration: this.duration
            });
            this.guesterHandler = __gestureHandler.init({
                rootEl: this.playerContainer
            });
            if (this.fullScreenHandler.isMobile) {
                initMobileEvents()();
            }
        };
        PlayerEvents.prototype.updateTime = function() {
            if (this.video.currentTime === this.duration) {
                stop.call(this);
            }
            this.currentTime = this.video.currentTime;
            updateTimeDetails.call(this);
            updatePlayerSliderUI.call(this);
        };
        PlayerEvents.prototype.progressVideo = function() {
            updateBufferedTime.call(this.mediaController, this.video.buffered);
            this.slider.__buffer.style.width = `${getBufferWidth.call(this)}%`;
        };
        PlayerEvents.prototype.videoWaiting = function() {
            this.container.loading();
            if (this.video.readyState < 2) {
                this.audio && this.audio.pause();
            } else if (this.video.readyState === 4) {
                play.call(this);
            }
        };
        PlayerEvents.prototype.onPlaying = function() {
            if (!this.video.paused) {
                this.container.play();
            }
            if (this.audio && Math.floor(this.currentTime) !== Math.floor(this.audio.currentTime)) {
                pause.call(this);
                this.audio.currentTime = this.currentTime ? this.currentTime : 0;
                if(isPlaying.call(this)){
                    play.call(this);
                }
            }
        };
        PlayerEvents.prototype.videoError = function() {
            pause.call(this);
        };
        PlayerEvents.prototype.audioError = function(e) {
            this.audio = null;
            pause.call(this);
            if (this.video) {
                this.video.muted = false;
            }
        }
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
                if (__player.fullScreenHandler.isMobile) {
                    __player.guesterHandler.subscribe();
                }
            }

            function removeEvents() {
                /* 
                if (__player.playerContainer) {
                    __player.eventsHandler.removeEvent(__player.playerContainer, "click", PlayerEvents.prototype.togglePlayPause.bind(__player));
                } */
                if (__player.fullScreenHandler.isMobile) {
                    __player.guesterHandler.unsubscribe();
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
                __player.eventsHandler.addNewEvent(__player.video, "error", PlayerEvents.prototype.videoError.bind(__player));
                __player.audio && __player.eventsHandler.addNewEvent(__player.audio, "error", PlayerEvents.prototype.audioError.bind(__player));
            }

            function removeEvents() {
                __player.eventsHandler.removeEvent(__player.video, "loadedmetadata", PlayerEvents.prototype.loadVideo.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "timeupdate", PlayerEvents.prototype.updateTime.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "progress", PlayerEvents.prototype.progressVideo.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "waiting", PlayerEvents.prototype.videoWaiting.bind(__player));
                __player.eventsHandler.removeEvent(__player.video, "playing", PlayerEvents.prototype.onPlaying.bind(__player));
                __player.eventsHandler.addNewEvent(__player.video, "error", PlayerEvents.prototype.videoError.bind(__player));
                __player.audio && __player.eventsHandler.addNewEvent(__player.audio, "error", PlayerEvents.prototype.audioError.bind(__player));
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
            if (__player.fullScreenHandler && __player.fullScreenHandler.isMobile) {
                initMobileEvents(true)();
            }
            window.removeEventListener("resize", function() {
                if (__player.fullScreenHandler && __player.fullScreenHandler.isMobile) {
                    initMobileEvents()();
                } else {
                    initMobileEvents(true)();
                }
            });
            __player.storageHandler.setState({
                [__player.playerId] : {
                    lastPlayed: __player.currentTime !== __player.duration ? __player.currentTime : 0,
                    lastVolume: __player.video.volume
                }
            });
            __player.guesterHandler && __player.guesterHandler.unsubscribe();
        }

        //Subscribe all events
        function subscribeEvents() {
            initPlayerEvents()();
            initControlsEvents()();
            initOverlayEvents()();
            initSeekingEvents()();
            window.addEventListener("resize", function() {
                if (__player.fullScreenHandler && __player.fullScreenHandler.isMobile) {
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