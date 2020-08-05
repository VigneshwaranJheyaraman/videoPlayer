(function(definition) {
    definition(window);
})(function(globalVariable) {
    const PLAYER_ACTIONS = {
            notStarted: "player-not-started",
            notPlaying: "player-not-playing"
        },
        PLAYER_FUNCTIONS = {
            play: function() {
                //show pause btn
                this.playerOverlayIcon.pause();
                if (this.playerContainer) {
                    this.playerContainer.classList.remove(PLAYER_ACTIONS.notStarted, PLAYER_ACTIONS.notPlaying);
                }
                //hide thumbnail
                if (this.thumbnailContainer) {
                    this.thumbnailContainer.style.opacity = 0;
                }
            },
            pause: function() {
                //show play btn
                this.playerOverlayIcon.play();
                if (this.playerContainer) {
                    this.playerContainer.classList.add(PLAYER_ACTIONS.notPlaying);
                }
            },
            stop: function() {
                this.playerOverlayIcon.stop();
            }
        },
        PLAYER_STYLES = {
            cssFiles: ["/player.css", "/overlay.css", "/actions.css", "/video.css"],
            playerContainer: {
                class: ["player-container", "player-not-started"],
                id: "container"
            },
            overlay: {
                class: ["overlay", "player-overlay"]
            },
            overlayIcon: {
                id: "playerOverlayIcon",
                class: ["overlay", "icon", "play"],
                controls: {
                    play: "play",
                    pause: "pause",
                    stop: "stop"
                }
            },
            thumbnail: {
                id: "playerPoster",
                class: ["overlay", "thumbnail"]
            },
            extras: {
                class: ["overlay", "extras"],
                slider: {
                    id: "videoSlider",
                    class: ["slider"]
                },
                cc: {
                    id: "cc",
                    class: ["sub"]
                },
                controls: {
                    class: ["flex", "controls"],
                    children: [{
                            class: "fa fa-2x fa-play",
                            id: "playBtn",
                            click: PLAYER_FUNCTIONS.play
                        },
                        {
                            class: "fa fa-2x fa-pause",
                            id: "pauseBtn",
                            click: PLAYER_FUNCTIONS.pause
                        },
                        {
                            class: "fa fa-2x fa-stop",
                            id: "stopBtn",
                            click: PLAYER_FUNCTIONS.stop
                        },
                        {
                            class: "fa fa-2x fa-window-maximize",
                            id: "fullScreenBtn"
                        },
                    ]
                }
            },
            video: {
                class: ["overlay"]
            }
        };

    //Defining the Component
    class VrajPlayer extends HTMLElement {
        constructor() {
            super();
            this.__shadowContainer = this.attachShadow({ mode: 'closed' });
            this.__cssRoot = "../js/components/style";
            this.init = this.init.bind(this);
            this.play = this.play.bind(this);
            this.pause = this.pause.bind(this);
            this.stop = this.stop.bind(this);
            this.togglePlayPause = this.togglePlayPause.bind(this);
            this.connectedCallback = this.connectedCallback.bind(this);
            this.attributeChangedCallback = this.attributeChangedCallback.bind(this);
            this.controls = this.controls.bind(this);
        }

        connectedCallback() {
            this.init();
            //init overlayIcon callback
            initOverlayIconEvents.call(this);
        }

        static get attr() {
            return {
                thumbnail: "thumbnail",
                player_src: "prc"
            };
        }

        static get observedAttributes() {
            return Object.values(VrajPlayer.attr);
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case VrajPlayer.attr.thumbnail:
                    if (oldValue !== newValue) {
                        this.thumbnail = newValue;
                    }
                    break;
            }
        }

        //player attributes
        get thumbnail() {
            return this.getAttribute(VrajPlayer.attr.thumbnail);
        }
        set thumbnail(val) {
            if (val) {
                this.setAttribute(VrajPlayer.attr.thumbnail, val);
                if (this.playerContainer) {
                    this.playerContainer.__thumbnail.remove();
                    var thumbnail = renderThumbnail(val);
                    this.playerContainer.__thumbnail = thumbnail;
                    this.playerContainer.append(thumbnail);
                }
            }
        }

        get prc() {
            return this.getAttribute(VrajPlayer.attr.player_src);
        }

        set prc(newSrc) {
            if (newSrc && newSrc.length && newSrc !== "undefined") {
                this.setAttribute(VrajPlayer.attr.player_src, newSrc);
                this.video.updateSource.call(this, newSrc);
            }
        }

        get slider() {
            return this.playerContainer;
        }

        //player attr ends here
        get playerContainer() {
            return this.__shadowContainer.querySelector(`#${PLAYER_STYLES.playerContainer.id}`);
        }

        get thumbnailContainer() {
            return this.playerContainer.__thumbnail;
        }

        get playerOverlayIcon() {
            return this.playerContainer.__overlay.__icon;
        }

        get video() {
            return this.playerContainer.__video;
        }

        get isSeperateAudio() {
            return this.video && this.video.muted;
        }

        get slider() {
            return this.playerContainer && this.playerContainer.__extras.__slider;
        }

        init() {
            PLAYER_STYLES.cssFiles.forEach(fileName => {
                this.__shadowContainer.appendChild(renderStyle({ href: `${this.__cssRoot}${fileName}` }));
            });
            //fwa css
            this.__shadowContainer.appendChild(renderStyle({
                href: "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
                integrity: "sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN",
                crossorigin: "anonymous"
            }));

            this.__shadowContainer.appendChild(
                renderPlayerContainer.call(this, {
                    thumbUrl: this.thumbnail,
                    video: {
                        src: this.prc ? this.prc : "#",

                    }
                })
            );
        }

        initOverlayIconEvents() {}

        togglePlayPause() {
            if (this.playerOverlayIcon) {
                if (this.playerOverlayIcon.classList.contains(PLAYER_STYLES.overlayIcon.controls.pause)) {
                    PLAYER_FUNCTIONS.pause.call(this);
                } else {
                    PLAYER_FUNCTIONS.play.call(this);
                }
            }
        }

        play() {
            PLAYER_FUNCTIONS.play.call(this);
        }

        pause() {
            PLAYER_FUNCTIONS.pause.call(this);
        }

        stop() {
            PLAYER_FUNCTIONS.stop.call(this);
        }

        controls() {
            return PLAYER_STYLES.extras.controls.children.map(control => {
                return { elem: this.__shadowContainer.getElementById(control.id) }
            });
        }

    }

    function generateClass(listOfClass) {
        return listOfClass.map(cls => cls.indexOf(".") !== -1 ? cls.replace(".", "") : cls).join(" ");
    }

    function initOverlayIconEvents() {
        this.playerOverlayIcon && this.playerOverlayIcon.addEventListener("click", this.togglePlayPause);
    }

    function renderStyle(props) {
        var link = document.createElement("link");
        Object.keys(props).forEach(prop => {
            link.setAttribute(prop, props[prop]);
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
        });
        return link;
    }

    function renderPlayerContainer(props) {
        var playerContainer = document.createElement("section");
        playerContainer.setAttribute("class", generateClass(PLAYER_STYLES.playerContainer.class));
        playerContainer.setAttribute("id", PLAYER_STYLES.playerContainer.id);
        var overlay = renderPlayerOverlay();
        playerContainer.__overlay = overlay;
        playerContainer.appendChild(overlay);
        var thumbnail = renderThumbnail(props.thumbUrl);
        playerContainer.__thumbnail = thumbnail;
        playerContainer.appendChild(thumbnail);
        var extras = renderExtras.call(this);
        playerContainer.__extras = extras;
        playerContainer.appendChild(extras);
        var video = renderVideo(props.video, props.video.src);
        playerContainer.__video = video;
        playerContainer.appendChild(video);
        return playerContainer;
    }

    function renderPlayerOverlay() {
        var overlay = document.createElement("div");
        overlay.setAttribute("class", generateClass(PLAYER_STYLES.overlay.class));
        var icon = renderOverlayIcon();
        overlay.__icon = icon;
        overlay.appendChild(icon);
        return overlay;
    }

    function renderOverlayIcon() {
        function pause() {
            this.classList.remove(PLAYER_STYLES.overlayIcon.controls.play);
            this.classList.remove(PLAYER_STYLES.overlayIcon.controls.stop);
            this.classList.add(PLAYER_STYLES.overlayIcon.controls.pause);
        }

        function play() {
            this.classList.remove(PLAYER_STYLES.overlayIcon.controls.pause);
            this.classList.remove(PLAYER_STYLES.overlayIcon.controls.stop);
            this.classList.add(PLAYER_STYLES.overlayIcon.controls.play);
        }

        function stop() {
            this.classList.remove(PLAYER_STYLES.overlayIcon.controls.play);
            this.classList.remove(PLAYER_STYLES.overlayIcon.controls.pause);
            this.classList.add(PLAYER_STYLES.overlayIcon.controls.stop);
        }

        var overlayIcon = document.createElement("div");
        overlayIcon.setAttribute("class", generateClass(PLAYER_STYLES.overlayIcon.class));
        overlayIcon.setAttribute("id", PLAYER_STYLES.overlayIcon.id);
        overlayIcon.play = play.bind(overlayIcon);
        overlayIcon.pause = pause.bind(overlayIcon);
        overlayIcon.stop = stop.bind(overlayIcon);
        return overlayIcon;
    }

    function renderThumbnail(thumbUrl) {
        var thumbnail = document.createElement("div");
        thumbnail.setAttribute("class", generateClass(PLAYER_STYLES.thumbnail.class));
        thumbnail.setAttribute("id", PLAYER_STYLES.thumbnail.id);
        if (thumbUrl && thumbUrl.length) {
            thumbnail.style.backgroundImage = `url(${thumbUrl})`;
        }
        return thumbnail;
    }

    function renderExtras() {
        function renderSlider() {
            var slider = document.createElement("input");
            slider.setAttribute("type", "range");
            slider.setAttribute("id", PLAYER_STYLES.extras.slider.id);
            slider.setAttribute("class", generateClass(PLAYER_STYLES.extras.slider.class));
            slider.value = 0;
            return slider;
        }

        function renderSubtitle() {
            var subtitle = document.createElement("div");
            subtitle.setAttribute("id", PLAYER_STYLES.extras.cc.id);
            subtitle.setAttribute("class", generateClass(PLAYER_STYLES.extras.cc.class));
            return subtitle;
        }

        function renderControls() {
            function renderControlIcons(props) {
                var icon = document.createElement("i");
                icon.setAttribute("class", props.class);
                icon.setAttribute("id", props.id);
                props.click && icon.addEventListener("click", props.click.bind(this));
                return icon;
            }
            var controls = document.createElement("div");
            controls.setAttribute("class", generateClass(PLAYER_STYLES.extras.controls.class));
            PLAYER_STYLES.extras.controls.children.forEach(child => {
                controls.appendChild(renderControlIcons.call(this, child));
            });
            return controls;
        }
        var extras = document.createElement("div");
        extras.setAttribute("class", generateClass(PLAYER_STYLES.extras.class));
        extras.appendChild(renderSubtitle());
        var slider = renderSlider();
        extras.__slider = slider;
        extras.appendChild(slider);
        extras.appendChild(renderControls.call(this));
        return extras;
    }

    function renderVideo(attrs = {}, src = "#") {
        function updateSource(newSrc) {
            this.video.__source.src = newSrc;
        }
        var video = document.createElement("video");
        video.setAttribute("class", generateClass(PLAYER_STYLES.video.class));
        if (attrs.a && attrs.a.src) {
            video.muted = true;
            var audio = document.createElement("audio");
            video.__audio = audio;
            Object.values(attrs.a.src).forEach(src => {
                var source = document.createElement("source");
                source.src = src;
                audio.appendChild(source);
            });
        }
        var source = document.createElement("source");
        source.src = src;
        video.__source = source;
        video.updateSource = updateSource;
        video.appendChild(source);
        return video;
    }

    if (globalVariable.customElements) {
        globalVariable.customElements.define("vraj-player", VrajPlayer);
    }
    return globalVariable;
});