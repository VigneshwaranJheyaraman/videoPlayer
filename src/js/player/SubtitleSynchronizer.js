class SubtitleSynchronizer {
    constructor(props) {
        this.__videoElement = props.video;
        this.__dictionary = props.subtitleDictionary;
        this.__currentSubtitle = null;
        this.__subtitleUICallback = null;
        this.__currentTime = props.video ? props.video.currentTime : null;

        this.__initVideoEvents = this.__initVideoEvents.bind(this);
        this.__sync = this.__sync.bind(this);
        this.__removeEvents = this.__removeEvents.bind(this);
        this.__updateTime = this.__updateTime.bind(this);
        this.__updateCurrentSubtitle = this.__updateCurrentSubtitle.bind(this);

        this.__initVideoEvents();
    }

    get currentTime() {
        return this.__currentTime;
    }
    set currentTime(newTime) {
        this.__currentTime = newTime;
    }

    get currentSub() {
        return this.__currentSubtitle ? this.__currentSubtitle : "";
    }
    set currentSub(newSub) {
        this.__currentSubtitle = newSub;
    }

    get subtitleUICallback() {
        return this.__subtitleUICallback;
    }
    set subtitleUICallback(newCB) {
        this.__subtitleUICallback = newCB;
    }

    __updateTime() {
        this.currentTime = this.__videoElement.currentTime;
    }

    __sync() {
        if (!this.__videoElement.paused) {
            this.__updateTime();
            this.__updateCurrentSubtitle();
            this.subtitleUICallback && this.subtitleUICallback();
        }
    }

    __initVideoEvents() {
        if (this.__videoElement) {
            this.__videoElement.addEventListener("timeupdate", this.__sync);
        }
        window.addEventListener("unload", this.__removeEvents);
    }

    __removeEvents() {
        this.__videoElement.removeEventListener("timeupdate", this.__sync);
    }

    __updateCurrentSubtitle() {
        var currentTime = parseFloat(this.currentTime.toFixed(2));
        Object.keys(this.__dictionary).forEach(key => {
            key = parseFloat(key);
            if ((currentTime - key) < 1 && (currentTime - key) >= 0) {
                if (currentTime < this.__dictionary[key].to) {
                    this.currentSub = this.__dictionary[key].subtitle;
                    this.subtitleUICallback && this.subtitleUICallback();
                }
                return;
            }
        });
    }
}