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
            this.init();
        }

        get thumbnail() {
            return this.hasAttribute('thumbnail');
        }
        set thumbnail(val) {
            if (val) {
                this.setAttribute('thumbnail', val);
            }
        }

        get player() {
            return this.__shadowContainer.querySelector(`#${PLAYER_STYLES.playerContainer.id}`);
        }

        init() {
            var style = document.createElement("style");
            PLAYER_STYLES.cssFiles.forEach(fileName => {
                style.innerText += `@import '${this.__cssRoot}${fileName}';\n`;
            });
            this.__shadowContainer.appendChild(style);
            this.__shadowContainer.appendChild(renderPlayerContainer());
        }

        play() {
            this.player.__overlay.__icon.play();
        }

        pause() {
            this.player.__overlay.__icon.pause();
        }

        stop() {
            this.player.__overlay.__icon.stop();
        }

    }

    function generateClass(listOfClass) {
        return listOfClass.map(cls => cls.indexOf(".") !== -1 ? cls.replace(".", "") : cls).join(" ");
    }

    function renderPlayerContainer() {
        var playerContainer = document.createElement("section");
        playerContainer.setAttribute("class", generateClass(PLAYER_STYLES.playerContainer.class));
        playerContainer.setAttribute("id", PLAYER_STYLES.playerContainer.id);
        var overlay = renderPlayerOverlay();
        playerContainer.__overlay = overlay;
        playerContainer.appendChild(overlay);
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
    if (globalVariable.customElements) {
        globalVariable.customElements.define("vraj-player", VrajPlayer);
        //debugging purpose
        //document.getElementById("d").outerHTML = renderPlayerContainer().outerHTML;
    }
    return globalVariable;
});