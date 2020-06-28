class SubtitleSynchronizer {
    constructor(subtitleDictionary) {
        this.__dictionary = subtitleDictionary;
        this.__currentSubtitle = null;
        this.__currentSec = 0;
        this.__milliSecCount = 0;
        this.__milliSecOffset = 100;
        this.__milliSecInterval = 100;
        this.__synchronizing = false;
        this.__synchronizingIntervalHandler = null;
        this.__stopped = false;
        this.__subtitleUICallback = null;

        this.initSync = this.initSync.bind(this);
        this.sync = this.sync.bind(this);
        this.pauseSync = this.pauseSync.bind(this);
        this.stopSync = this.stopSync.bind(this);
        this.__clearSync = this.__clearSync.bind(this);
        this.__updateCurrentSubtitle = this.__updateCurrentSubtitle.bind(this);
        this.__updateTime = this.__updateTime.bind(this);
        this.__runTimer = this.__runTimer.bind(this);
        this.__synchronize = this.__synchronize.bind(this);
        this.__initializeSynchronizer = this.__initializeSynchronizer.bind(this);
    }

    get currentTime() {
        return this.__currentSec + (this.__milliSecCount / 1000);
    }

    get subtitleUICallback() {
        return this.__subtitleUICallback;
    }
    set subtitleUICallback(domUpdates) {
        this.__subtitleUICallback = domUpdates;
    }

    initSync() {
        this.__synchronizingIntervalHandler = this.__initializeSynchronizer();
    }

    sync() {
        if (!this.__synchronizingIntervalHandler) {
            this.initSync();
        }
        this.__synchronizing = true;
    }

    pauseSync() {
        this.__synchronizing = false;
    }

    stopSync() {
        this.__stopped = true;
        this.__synchronizing = false;
    }

    __runTimer() {
        if (this.__milliSecCount < 1000) {
            this.__milliSecCount += this.__milliSecOffset;
        } else {
            this.__milliSecCount = 0;
            this.__currentSec += 1;
        }
    }

    __clearSync() {
        clearInterval(this.__synchronizingIntervalHandler);
        this.__currentSec = 0;
        this.__milliSecCount = 0;
        this.__currentSubtitle = null;
        this.__synchronizing = false;
        this.__synchronizingIntervalHandler = null;
    }


    __updateCurrentSubtitle() {
        var currentTime = this.currentTime;
        Object.keys(this.__dictionary).forEach(key => {
            key = parseFloat(key);
            if ((currentTime - key) < 1 && (currentTime - key) >= 0) {
                if (currentTime < this.__dictionary[key].to) {
                    this.__currentSubtitle = this.__dictionary[key].subtitle;
                    this.subtitleUICallback && this.subtitleUICallback();
                }
                return;
            }
        });
    }

    __synchronize() {
        this.__updateTime();
        this.__updateCurrentSubtitle();
    }


    __updateTime() {
        if (this.__synchronizing) {
            this.__runTimer();
            console.log(this.__currentSubtitle, this.currentTime);
        }
        if (this.__stopped) {
            this.__clearSync();
        }
    }

    __initializeSynchronizer() {
        this.__stopped = false;
        return setInterval(this.__synchronize, this.__milliSecInterval);
    }
}