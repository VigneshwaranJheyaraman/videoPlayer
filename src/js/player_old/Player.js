class Player {
    constructor(playerProps) {
        this.__playerContainer = playerProps.root;
        this.__playerMinHeight = 500;
        this.__playerSrc = playerProps.src ? playerProps.src : "#";
        this.__canPlayVideo = this.__checkVideoPlayable();
        this.__canGoFullScreen = this.__fullScreenAvailable();
        this.__isPDA = false;
        this.__fullScreenIsEnabled = this.__fullScreenEnabled();
        this.__updateContainerHeight(this.__playerMinHeight);
        this.booleanize = this.booleanize.bind(this);
        this.__checkVideoPlayable = this.__checkVideoPlayable.bind(this);
        this.__fullScreenAvailable = this.__fullScreenAvailable.bind(this);
        this.__fullScreenEnabled = this.__fullScreenEnabled.bind(this);
        this.__enableFullScreenListener = this.__enableFullScreenListener.bind(this);
        this.__removeAllFullScreenListener = this.__removeAllFullScreenListener.bind(this);
        this.__goFullScreen = this.__goFullScreen.bind(this);
        this.__exitFullScreen = this.__exitFullScreen.bind(this);
        this.toggleFullScreen = this.toggleFullScreen.bind(this);
        this.__updateFullScreenState = this.__updateFullScreenState.bind(this);
        this.__updateContainerHeight = this.__updateContainerHeight.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.__checkIsPDA = this.__checkIsPDA.bind(this);
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

    get isPDA() {
        return this.__isPDA;
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

    __checkIsPDA() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.__isPDA = true;
        }
    }

    //go ,exit and toggle full screen
    __goFullScreen() {
        this.isFullScreen = this.__fullScreenEnabled();
        if (this.__playerContainer && !this.isFullScreen) {
            try {
                if (this.__playerContainer.requestFullscreen) this.__playerContainer.requestFullscreen();
                else if (this.__playerContainer.mozRequestFullScreen) this.__playerContainer.mozRequestFullScreen();
                else if (this.__playerContainer.webkitRequestFullScreen) this.__playerContainer.webkitRequestFullScreen();
                else if (this.__playerContainer.msRequestFullscreen) this.__playerContainer.msRequestFullscreen();
                this.__updateFullScreenState();
            } catch (err) {
                console.error("Erro going full screen", err);
            }
        }
    }

    __exitFullScreen() {
        this.isFullScreen = this.__fullScreenEnabled();
        if (document && this.isFullScreen) {
            try {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
                this.__updateFullScreenState();
            } catch (err) {
                console.error("Error exiting full screen ", err);
            }
        }
    }

    toggleFullScreen() {
        this.isFullScreen = this.__fullScreenEnabled();
        if (!this.isFullScreen) {
            this.__goFullScreen();
        } else {
            this.__exitFullScreen();
        }
    }

    __updateFullScreenState() {
        this.isFullScreen = this.__fullScreenEnabled();
        this.__playerContainer.setAttribute("data-fullscreen", this.isFullScreen);
    }

    //enable full screen listener and remove all listeners
    __enableFullScreenListener() {
        document.addEventListener("fullscreenchange", this.__updateFullScreenState);
        document.addEventListener("webkitfullscreenchange", this.__updateFullScreenState);
        document.addEventListener("msfullscreenchange", this.__updateFullScreenState);
        document.addEventListener("mozfullscreenchange", this.__updateFullScreenState);
        window.addEventListener("unload", this.unsubscribe);
    }

    __removeAllFullScreenListener() {
        document.removeEventListener("fullscreenchange", this.__updateFullScreenState);
        document.removeEventListener("webkitfullscreenchange", this.__updateFullScreenState);
        document.removeEventListener("msfullscreenchange", this.__updateFullScreenState);
        document.removeEventListener("mozfullscreenchange", this.__updateFullScreenState);
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
        this.__enableFullScreenListener();
        this.__checkIsPDA();
    }
}