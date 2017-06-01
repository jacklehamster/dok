'use strict';

requirejs.config({
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        dobuki: 'dobuki',
        jsgif: 'jsgif/gif'
    },
    urlArgs: "bust=" + Date.now()
});

require(["dobuki"], function (DOK) {});
//# sourceMappingURL=main.js.map