class SubtitleExtractor {
    static Formats = {
        srt: ".srt"
    };
    constructor(props) {
        this.__format = SubtitleExtractor.Formats.srt;
        this.__subtitleUrl = props.url ? props.url : "";
        this.__extractFromUrl = true;
        this.__subtitleDictionary = {};
        this.__subtitleTextResponse = null;
        this.__videoSynchronizer = null;
        this.__subtitleRegex = {
            newLine: "\n",
            everyNewSubtitle: /^$/,
            subtitleCount: /^[0-9]{1,5}$/,
            fromToTime: /(([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5})\s*(-->)\s*(([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5})/,
            time: /([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5}/,
            nextSubPointer: "<=>",
            fromToSplitter: /\s*(-->)\s*/,
            fromToPointer: "="
        };

        this.__fetchSubtitleFromURL = this.__fetchSubtitleFromURL.bind(this);
        this.__extractHMSMS = this.__extractHMSMS.bind(this);
        this.__convertToSeconds = this.__convertToSeconds.bind(this);
        this.__subtitleResponeParser = this.__subtitleResponeParser.bind(this);
        this.__initializeSubtitleDictionary = this.__initializeSubtitleDictionary.bind(this);
        this.__initializeSynchronizer = this.__initializeSynchronizer.bind(this);
    }

    get url() {
        return this.__subtitleUrl;
    }
    set url(newUrl) {
        this.__subtitleUrl = newUrl;
        this.__fetchSubtitleFromURL();
    }

    __fetchSubtitleFromURL() {
        if (this.url) {
            fetch(this.url, {
                method: "GET"
            }).then(response => {
                if (/20[0-9]/.test(response.status)) {
                    //successfull response
                    return response.text();
                } else {
                    throw new Error("No response from the specified URL " + this.url);
                }
            }).then(textResponse => {
                this.__subtitleTextResponse = textResponse;
            }).catch(err => {
                throw new Error("Error processing the request " + err);
            });
        }
    }

    __convertToSeconds(time) {
        return (time.hour * 60 * 60) + (time.min * 60) + (time.sec) + (time.microSec / 1000)
    }

    __extractHMSMS(timeString) {
        var timeFormat = /([0-9][0-9]):([0-9][0-9]):([0-9][0-9]),[0-9]{1,5}/;
        if (timeFormat.test(timeString)) {
            var timeSplitted = timeString.split(":");
            var hour = parseInt(timeSplitted[0], 10);
            var min = parseInt(timeSplitted[1], 10);
            var sec = parseInt(timeSplitted[2].split(",")[0], 10);
            var microSec = parseInt(timeSplitted[2].split(",")[1], 10);
            return {
                hour,
                min,
                sec,
                microSec
            };
        }
    }

    __subtitleResponeParser() {
        this.__subtitleDictionary = {};
        if (this.__subtitleTextResponse) {
            var onlySubtitlesInfoList = this.__subtitleTextResponse.split(this.__subtitleRegex.newLine);
            onlySubtitlesInfoList = onlySubtitlesInfoList.map(line => line.replace(this.__subtitleRegex.everyNewSubtitle, this.__subtitleRegex.nextSubPointer));
            onlySubtitlesInfoList = onlySubtitlesInfoList.filter(line => !this.__subtitleRegex.subtitleCount.test(line));
            var lastTimeInterval = null;
            for (var i = 0; i < onlySubtitlesInfoList.length; i++) {
                var currentInfo = onlySubtitlesInfoList[i];
                if (currentInfo !== this.__subtitleRegex.nextSubPointer) {
                    if (this.__subtitleRegex.fromToTime.test(currentInfo)) {
                        var fromtoTimeString = currentInfo.replace(this.__subtitleRegex.fromToSplitter, this.__subtitleRegex.fromToPointer).split(this.__subtitleRegex.fromToPointer);
                        var fromTime = this.__convertToSeconds(this.__extractHMSMS(fromtoTimeString[0])),
                            toTime = this.__convertToSeconds(this.__extractHMSMS(fromtoTimeString[1]));
                        this.__subtitleDictionary[fromTime] = { to: toTime, subtitle: '' };
                        lastTimeInterval = fromTime;
                    } else {
                        this.__subtitleDictionary[lastTimeInterval].subtitle += currentInfo;
                    }
                }
            }
        }
    }

    __initializeSubtitleDictionary() {
        this.__fetchSubtitleFromURL();
        this.__subtitleResponeParser();
        this.__initializeSynchronizer();
    }

    __initializeSynchronizer() {
        if (JSON.stringify(this.__subtitleDictionary) !== JSON.stringify({})) {
            this.__videoSynchronizer = new SubtitleSynchronizer(this.__subtitleDictionary);
        }
    }

}