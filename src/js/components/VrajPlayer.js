(function(definition) {
    definition(window);
})(function(globalVariable) {
    const PLAYER_STYLES = {
        cssFiles: ["/player.css", "/overlay.css", "/actions.css"],
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
                        click: function() {
                            this.pause();
                        }
                    },
                    {
                        class: "fa fa-2x fa-pause",
                        id: "pauseBtn",
                        click: function() {
                            this.play();
                        }
                    },
                    {
                        class: "fa fa-2x fa-stop",
                        id: "stopBtn",
                        click: function() {
                            this.stop();
                        }
                    },
                    {
                        class: "fa fa-2x fa-window-maximize",
                        id: "fullScreenBtn"
                    },
                ]
            }
        }
    }

    //Defining the Component
    class VrajPlayer extends HTMLElement {
        constructor() {
            super();
            this.__shadowContainer = this.attachShadow({ mode: 'open' });
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
        }

        static get attr() {
            return {
                thumbnail: "thumbnail"
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

        get playerContainer() {
            return this.__shadowContainer.querySelector(`#${PLAYER_STYLES.playerContainer.id}`);
        }

        get thumbnailContainer() {
            return this.playerContainer.__thumbnail;
        }

        get playerOverlayIcon() {
            return this.playerContainer.__overlay.__icon;
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
            this.__shadowContainer.appendChild(renderPlayerContainer({ thumbUrl: this.thumbnail }));
        }

        play() {
            this.playerOverlayIcon.play();
        }

        togglePlayPause() {
            if (this.playerOverlayIcon) {
                if (this.playerOverlayIcon.classList.contains(PLAYER_STYLES.overlayIcon.controls.pause)) {
                    this.play();
                } else {
                    this.pause();
                }
            }
        }

        pause() {
            this.playerOverlayIcon.pause();
        }

        stop() {
            this.playerOverlayIcon.stop();
        }

        controls() {
            return PLAYER_STYLES.extras.controls.children.map(control => {
                return { elem: this.__shadowContainer.getElementById(control.id), click: control.click && control.click.bind(this) }
            });
        }

    }

    function generateClass(listOfClass) {
        return listOfClass.map(cls => cls.indexOf(".") !== -1 ? cls.replace(".", "") : cls).join(" ");
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
        var extras = renderExtras();
        playerContainer.__extras = extras;
        playerContainer.appendChild(extras);
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
                return icon;
            }
            var controls = document.createElement("div");
            controls.setAttribute("class", generateClass(PLAYER_STYLES.extras.controls.class));
            PLAYER_STYLES.extras.controls.children.forEach(child => {
                controls.appendChild(renderControlIcons(child));
            });
            return controls;
        }

        var extras = document.createElement("div");
        extras.setAttribute("class", generateClass(PLAYER_STYLES.extras.class));
        extras.appendChild(renderSubtitle());
        extras.appendChild(renderSlider());
        extras.appendChild(renderControls());
        return extras;
    }

    if (globalVariable.customElements) {
        globalVariable.customElements.define("vraj-player", VrajPlayer);
        //debugging purpose
        //document.getElementById("d").outerHTML = renderPlayerContainer().outerHTML;
    }
    return globalVariable;
});