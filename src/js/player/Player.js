class Player {
    constructor(playerProps) {
        this.__playerContainer = playerProps.root;
        this.__playerMinHeight = 500;
        this.__playerSrc = playerProps.src ? playerProps.src : "#";
        this.__canPlayVideo = this.__checkVideoPlayable();
        this.__canGoFullScreen = this.__fullScreenAvailable();
        this.__fullScreenIsEnabled = this.__fullScreenEnabled();
        this.__updateContainerHeight(this.__playerMinHeight);
        window.addEventListener("load", this.subscribe);
    }

    get isFullScreen() {
        return this.__fullScreenIsEnabled;
    }

    set isFullScreen(enabledOrNot) {

        this.__fullScreenIsEnabled = enabledOrNot;
    }

    get src() {
        return this.__playerSrc;
    }

    set src(newSrc) {
        this.__playerSrc = newSrc;
    }

    get videoPlayable() {
        return this.__canPlayVideo;
    }

    booleanize(cond) {
        return !!cond;
    }

    __checkVideoPlayable() {
        return this.booleanize(document.createElement("video").canPlayType)
    }

    __fullScreenAvailable() {
        return this.booleanize(document.fullccreenEnabled || document.mozFullScreenEnabled || document.msFullScreenEnabled || document.webkitFullScreenEnabled || document.webkitSupportsFullScreen || document.createElement("video").requestFullScreen);
    }

    __fullScreenEnabled() {
        return this.booleanize(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullScreenElement || document.fullscreenElement);
    }

    //go ,exit and toggle full screen
    goFullScreen() {
        this.isFullScreen = this.__fullScreenEnabled();
        if (this.__playerContainer && !this.isFullScreen) {
            this.isFullScreen = true;
            this.__playerContainer.setAttribute("data-fullscreen", this.isFullScreen);
        }
    }

    exitFullScreen() {
        this.isFullScreen = this.__fullScreenEnabled();
        if (this.__playerContainer && this.isFullScreen) {
            this.isFullScreen = false;
            this.__playerContainer.setAttribute("data-fullscreen", this.isFullScreen);
        }
    }

    __toggleFullScreen() {
        this.isFullScreen = this.__fullScreenEnabled();
        if (this.isFullScreen) {
            this.goFullScreen();
        } else {
            this.exitFullScreen();
        }
    }

    //enable full screen listener and remove all listeners
    static enableFullScreenListener() {
        document.addEventListener("fullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        document.addEventListener("webkitfullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        document.addEventListener("msfullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        document.addEventListener("mozfullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        window.addEventListener("unload", (e) => {
            this.unsubscribe();
        });
    }

    __removeAllFullScreenListener() {
        document.removeEventListener("fullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        document.removeEventListener("webkitfullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        document.removeEventListener("msfullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
        document.removeEventListener("mozfullscreenchange", (e) => {
            this.__toggleFullScreen();
        });
    }

    //update container height --DOM
    __updateContainerHeight(newHeight) {
        if (this.__playerContainer) {
            this.__playerContainer.style.minHeight = `${newHeight}px`;
        }
    }

    //subscribe and unsubscribe methods
    unsubscribe() {
        this.__removeAllFullScreenListener();
    }

    subscribe() {
        Player.enableFullScreenListener();
    }

    static returnThisBoundedFunction(func, anyParams = undefined) {
        var parms = anyParams ? anyParams : undefined;
        return (parms) => {
            func();
        }
    }
}