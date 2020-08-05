(function(definition) {
    window.player = {};
    definition(window.player);
})(function(globalVariable) {
    function VrajPlayer(props) {
        var __player = {
                container: null,
                rootElem: document.body,
                playerContainer: null,
                controls: null,
                video: null,
                overlayIcon: null,
                slider: null,
                duration: null,
                __currentTime: null,
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
                }
            },
            player = {
                get rootEl() {
                    return __player.rootElem;
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
                play() {
                    if (__player.video) {
                        __player.video.play();
                    }
                },
                pause() {
                    if (__player.video) {
                        __player.video.pause();
                    }
                },
                stop() {
                    if (__player.video) {
                        __player.video.currentTime = __player.video.duration;
                    }
                },
                get duration() {
                    return __player.duration;
                }
            };

        //initialize properties of player
        function propsInit(props) {
            player.rootEl = props.rootElement;
        }

        function seek(e) {
            if (e.target) {
                this.currentTime = (parseFloat(e.target.value) / 100) * __player.duration;
                updateVideoTime.call(this);
            }
        }

        function updateVideoTime() {
            this.video.currentTime = __player.currentTime;
        }

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
            unsubscribeEvents();
            subscribeEvents();
        }

        function unsubscribeEvents() {
            window.addEventListener("unload", function() {
                __player.video && __player.video.removeEventListener("load", function() {
                    __player.duration = __player.video.duration;
                });
                if (__player.controls) {
                    Object.values(__player.controls).forEach(control => {
                        if (control.id && control.id.indexOf("play") !== -1) {
                            control.removeEventListener("click", player.play);
                        } else if (control.id && control.id.indexOf("pause") !== -1) {
                            control.removeEventListener("click", player.pause)
                        } else if (control.id && control.id.indexOf("stop") !== -1) {
                            control.removeEventListener("click", player.stop);
                        }
                    })
                }
                __player.overlayIcon && __player.overlayIcon.removeEventListener("click", function() {
                    if (__player.video.paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                });
            });
        }

        function subscribeEvents() {
            __player.video && __player.video.addEventListener("loadedmetadata", function() {
                __player.duration = __player.video.duration;
            });
            __player.video && __player.video.addEventListener("timeupdate", function() {
                __player.currentTime = __player.video.currentTime;
                __player.slider.value = parseFloat((__player.currentTime / __player.duration).toFixed(2)) * 100;
            });
            __player.slider && __player.slider.addEventListener("input", function(e) {
                seek.call(__player, e);
            });
            if (__player.controls) {
                Object.values(__player.controls).forEach(control => {
                    control = control.elem;
                    if (control.id && control.id.indexOf("play") !== -1) {
                        control.addEventListener("click", player.play);
                    } else if (control.id && control.id.indexOf("pause") !== -1) {
                        control.addEventListener("click", player.pause)
                    } else if (control.id && control.id.indexOf("stop") !== -1) {
                        control.addEventListener("click", player.stop);
                    }
                })
            }
            __player.overlayIcon && __player.overlayIcon.addEventListener("click", function() {
                if (__player.video.paused) {
                    player.play();
                } else {
                    player.pause();
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