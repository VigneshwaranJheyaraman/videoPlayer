class VrajPlayer extends Player {
    constructor(properties) {
        super(properties);
        this.__playerElement = properties.video;
        this.__updateVideoSource();
        this.__intializeVideoElementProperties();
    }

    subscribe() {
        super.subscribe();
    }

    __updateVideoSource() {
        var sourceList = this.__playerElement.querySelectorAll("source");
        sourceList && Object.assign([], sourceList).forEach(source => {
            source.src = this.src;
        });
        this.__playerElement && this.__playerElement.load();
    }

    __intializeVideoElementProperties() {
        if (this.videoPlayable) {
            this.__playerElement.controls = false;
        }
    }
}