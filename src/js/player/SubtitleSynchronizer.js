class SubtitleSynchronizer {
    constructor(subtitleDictionary) {
        this.__dictionary = subtitleDictionary;
        this.__currentSubtitle = null;
        this.__currentTime = 0;
        this.__milliSecOffset = 1;
        this.__milliSecInterval = 1000;
        this.__synchronizing = false;
        this.__synchronizingIntervalHandler = null;
        this.__stopped = false;

        this.initSync = this.initSync.bind(this);
        this.sync = this.sync.bind(this);
        this.stopSync = this.stopSync.bind(this);
        this.__clearSync = this.__clearSync.bind(this);
        this.__updateCurrentSubtitle = this.__updateCurrentSubtitle.bind(this);
        this.__updateTime = this.__updateTime.bind(this);
        this.__initializeSynchronizer = this.__initializeSynchronizer.bind(this);
    }

    initSync() {
        this.__synchronizingIntervalHandler = this.__initializeSynchronizer();
    }

    sync() {
        if (!this.__synchronizingIntervalHandler) {
            this.initSync();
        }
        this.__synchronizing = true;
        this.__updateCurrentSubtitle();
        console.log(this.__currentSubtitle);
    }

    stopSync() {
        this.__stopped = true;
    }

    __clearSync() {
        clearInterval(this.__synchronizingIntervalHandler);
        this.__currentTime = 0;
        this.__currentSubtitle = null;
        this.__synchronizing = false;
        this.__synchronizingIntervalHandler = null;
    }


    __updateCurrentSubtitle() {
        Object.keys(this.__dictionary).forEach(key => {
            key = parseFloat(key);
            if ((this.__currentTime - key) < 1 && (this.__currentTime - key) >= 0) {
                if (this.__currentTime < this.__dictionary[key].to) {
                    this.__currentSubtitle = this.__dictionary[key].subtitle;
                }
                return;
            }
        });
    }

    __updateTime() {
        if (this.__synchronizing) {
            this.__currentTime += this.__milliSecOffset;
        }
        if (this.__stopped) {
            this.__clearSync();
        }
    }

    __initializeSynchronizer() {
        this.__stopped = false;
        return setInterval(this.__updateTime, this.__milliSecInterval);
    }
}