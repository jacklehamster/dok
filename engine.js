define([
    'threejs',
    'loader',
    'loop',
    'camera',
], function(THREE, Loader, Loop, Camera) {
    function Engine(options) {
        const self = this;
        options = options || {};
        const renderer = this.renderer = new THREE.WebGLRenderer({
            canvas: options.canvas
        });
        this.renderer.sortObjects = false;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor ('white', 1);
        window.addEventListener("resize",function(e) {
            windowResized = true;
        });
        const scene = this.scene = new THREE.Scene();
        let sceneWidth = 0, sceneHeight = 0, windowResized = true;
        this.renderer.domElement.style.display = "none";
        Loader.setOnLoad(function () {
            renderer.domElement.style.display = "";
            Loop.addLoop(function() {
                checkResize();
                renderer.render(scene, Camera.getCamera());
            });
            self.ready = true;
        });

        function checkResize() {
            if (!windowResized) {
                return;
            }
            const width = renderer.domElement.parentElement.offsetWidth;
            const height = renderer.domElement.parentElement.offsetHeight;
            if(sceneWidth !== width || sceneHeight !== height) {
                sceneWidth = width;
                sceneHeight = height;
                renderer.setSize( width, height );
                Camera.checkWindowSize( width, height );
            }
            windowResized = false;
        }
    }
    Engine.prototype.renderer = null;
    Engine.prototype.scene = null;
    Engine.prototype.ready = false;

    return Engine;
});