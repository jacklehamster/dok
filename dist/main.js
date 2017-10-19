'use strict';

requirejs.config({
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        dobuki: 'dobuki',
        jsgif: 'jsgif/gif'
    },
    urlArgs: location.search.match(/\bdebug\b|\bdisable_cache\b/g) ? "time=" + Date.now() : ''
});

require(["dobuki"], function (DOK) {});
//# sourceMappingURL=main.js.map