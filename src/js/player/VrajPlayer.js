(function(definition) {
    window.player = {};
    definition(window.player);
})(function(globalVariable) {
    function VrajPlayer(props) {
        var __player = {
                container: null,
                rootElem: document.body,
                playerContainer: null,
                controls: null
            },
            player = {
                get rootEl() {
                    return __player.rootElem;
                },
                set rootEl(rootElementName) {
                    if (rootElementName.length) {
                        var root = document.getElementById(rootElementName);
                        if (root) {
                            __player.rootElem = root;
                            __player.container && __player.container.remove();
                            domInit(props);
                        }
                    }
                }
            };

        //initialize properties of player
        function propsInit(props) {
            player.rootEl = props.rootElement;
        }

        // intialize dom for the player
        function domInit(props) {
            var vrajPlayer = document.createElement("vraj-player");
            if (props.thumbnail) {
                vrajPlayer.setAttribute("thumbnail", props.thumbnail);
            }
            __player.container = vrajPlayer;
            __player.rootElem && __player.rootElem.append(vrajPlayer);
            __player.playerContainer = vrajPlayer.playerContainer;
            __player.controls = vrajPlayer.controls();
            unsubscribeEvents();
            subscribeEvents();
        }

        function unsubscribeEvents() {}

        function subscribeEvents() {}

        function init() {
            propsInit(props);
        }

        //initialize the vrajplayer
        init();
        return player;
    };

    globalVariable.VrajPlayer = VrajPlayer;
});