'use strict';

require(['threejs'], function (THREE) {
    function Renderer(canvas) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas
        });
        renderer.sortObjects = false;
        renderer.setPixelRatio(window.devicePixelRatio);
        if (!canvas) {
            document.body.appendChild(renderer.domElement);
        }
    }
    Renderer.prototype.renderer = null;

    return Renderer;
});
//# sourceMappingURL=renderer.js.map