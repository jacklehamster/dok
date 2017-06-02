

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

define('utils',[],function () {
    /**
     *  FUNCTION DEFINITIONS
     */
    function fixPath() {
        var regex = /\/$|index\.html$|next\.html$/g;
        if (!regex.exec(location.pathname)) {
            window.history.pushState(null, "", location.pathname + "/" + location.search + location.hash);
        }
    }

    function changeScene(scene, htmlFile) {
        if (typeof htmlFile === 'undefined') {
            htmlFile = 'scene.html';
        }
        Utils.destroyEverything();
        location.replace("../" + scene + "/" + htmlFile);
    }

    function handleError(error, soft) {
        if (Array.isArray(error)) {
            var array = [];
            for (var i = 0; i < error.length; i++) {
                array.push(error[i]);
                array.push("\n ");
            }
            console.error.apply(null, array);
        } else {
            console.error(error);
        }
        Utils.lastError = error;
        if (!soft) {
            throw new Error("Last error terminated the process.");
        }
    }

    function combineMethods(firstMethod, secondMethod) {
        return function () {
            if (firstMethod) firstMethod();
            if (secondMethod) secondMethod();
        };
    }

    function expectParams(args) {
        assert((typeof args === "undefined" ? "undefined" : _typeof(args)) === 'object', "Pass 'arguments' to expectParams");

        for (var i = 1; i < arguments.length; i++) {
            var type = args[i - 1] === null ? 'null' : Array.isArray(args[i - 1]) ? 'array' : _typeof(args[i - 1]);
            assert(arguments[i].split("|").indexOf(type) >= 0, ["Expected argument " + (i - 1) + " to be " + arguments[i] + " NOT " + type, args]);
        }
    }

    function checkParams(args) {
        assert((typeof args === "undefined" ? "undefined" : _typeof(args)) === 'object', "Pass 'arguments' to expectParams");

        for (var i = 1; i < arguments.length; i++) {
            var type = args[i - 1] === null ? 'null' : Array.isArray(args[i - 1]) ? 'array' : _typeof(args[i - 1]);
            if (arguments[i].split("|").indexOf(type) < 0) {
                return false;
            }
        }
        return true;
    }

    function assert(condition, message) {
        if (!condition) {
            handleError(message ? message : "Assert failed: condition not met.");
        }
    }

    function cleanUp() {
        Utils.destroyEverything();
    }

    function setupExit() {
        document.onbeforeunload = window.onbeforeunload = cleanUp;
    }

    var destroyEverything = function destroyEverything() {};
    function onDestroy(callback) {
        destroyEverything = Utils.combineMethods(callback, destroyEverything);
    }

    function definePrototypes() {
        if (typeof String.prototype.trim === "undefined") {
            String.prototype.trim = function () {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }

        if (!window.requestAnimationFrame) {
            setupRequestAnimationFrame();
        }

        if (typeof Float32Array.prototype.fill === 'undefined') {
            Float32Array.prototype.fill = fill_compat;
        }

        if (typeof Uint32Array.prototype.fill === 'undefined') {
            Uint32Array.prototype.fill = fill_compat;
        }

        Array.prototype.getFrame = function (index) {
            index = index | 0;
            return this[index % this.length];
        };
        Number.prototype.getFrame = function () {
            return this;
        };
    }

    function fill_compat(value, start, end) {
        start = start || 0;
        end = end || this.length;
        for (var i = start; i < end; i++) {
            this[i] = value;
        }
        return this;
    }

    function setupRequestAnimationFrame() {
        window.requestAnimationFrame = function () {
            return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame_compat;
        }();

        var timeout,
            time = 0;
        function requestAnimationFrame_compat(callback) {
            timeout = setTimeout(timeoutCallback, 1000 / 60, callback);
        }

        function timeoutCallback(callback) {
            clearTimeout(timeout);
            var dt = Date.now() - time;
            callback(dt);
            time = Date.now();
        }
    }

    function loadAsyncHelper(src, result, index, callback, binary, method, data) {
        loadAsync(src, function (value) {
            result[index] = value;
            for (var i = 0; i < result.length; i++) {
                if (result[i] === undefined) {
                    return;
                }
            }
            callback.apply(null, result);
        }, binary, method, data);
    }

    function loadAsync(src, callback, binary, method, data) {
        if (Array.isArray(src)) {
            var result = new Array(src.length);
            for (var i = 0; i < src.length; i++) {
                loadAsyncHelper(src[i], result, i, callback);
            }
        } else {
            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType(binary ? "text/plain; charset=x-user-defined" : "text/plain; charset=UTF-8");
            xhr.open(method ? method : "GET", src, true);
            xhr.addEventListener('load', function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        callback(xhr.responseText);
                    } else {
                        handleError(xhr.responseText);
                    }
                }
            });
            xhr.addEventListener('error', function (e) {
                handleError(e);
            });
            xhr.send(data);
        }
    }

    //      C
    //     748
    //    B3019
    //     625
    //      A


    function Roundabout() {
        this.x = 0;
        this.y = 0;
        this.left = -1;
        this.right = 1;
        this.top = -1;
        this.bottom = 1;
        this.direction = 0; //  0-right, 1-bottom, 2-left, 3-up

        var point = [0, 0];

        this.reset = function () {
            this.x = 0;
            this.y = 0;
            this.left = -1;
            this.right = 1;
            this.top = -1;
            this.bottom = 1;
            this.direction = 0; //  0-right, 1-bottom, 2-left, 3-up
        };

        this.current = function () {
            point[0] = this.x;
            point[1] = this.y;
            return point;
        };

        this.next = function () {
            var point = this.current();
            switch (this.direction) {
                case 0:
                    this.x++;
                    if (this.x >= this.right) {
                        this.right++;
                        this.direction = (this.direction + 1) % 4; //  change dir
                    }
                    break;
                case 1:
                    this.y++;
                    if (this.y >= this.bottom) {
                        this.bottom++;
                        this.direction = (this.direction + 1) % 4;
                    }
                    break;
                case 2:
                    this.x--;
                    if (this.x <= this.left) {
                        this.left--;
                        this.direction = (this.direction + 1) % 4; //  change dir
                    }
                    break;
                case 3:
                    this.y--;
                    if (this.y <= this.top) {
                        this.top--;
                        this.direction = (this.direction + 1) % 4; //  change dir
                    }
                    break;
            }
            return point;
        };
    }

    function addLinkToHeadTag(rel, href) {
        var link = document.createElement("link");
        link.setAttribute("rel", rel);
        link.href = href;
        document.head.appendChild(link);
    }

    function getTitle() {
        return title;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    var title = "";

    function Utils() {
        this.lastError = null;
    }
    Utils.handleError = handleError;
    Utils.changeScene = changeScene;
    Utils.destroyEverything = destroyEverything;
    Utils.combineMethods = combineMethods;
    Utils.expectParams = expectParams;
    Utils.checkParams = checkParams;
    Utils.assert = assert;
    Utils.fixPath = fixPath;
    Utils.onDestroy = onDestroy;
    Utils.loadAsync = loadAsync;
    Utils.Roundabout = Roundabout;
    Utils.getTitle = getTitle;

    /**
     *   PROCESSES
     */
    setupExit();
    definePrototypes();

    /*    loadAsync("package.json", function(str) {
            try {
                var object = JSON.parse(str);
                var icon = object.window.icon || require.toUrl('images/logo.ico');
                document.title = object.window.title || 'Dobuki Game';
                addLinkToHeadTag("shortcut icon", icon);
                addLinkToHeadTag("apple-touch-icon", object.window['apple-touch-icon'] || icon);
            } catch(e) {
            }
        });
    */

    return Utils;
});
//# sourceMappingURL=utils.js.map;


define('loop',['utils'], function (Utils) {
    'use strict';

    var coreLoops = null;
    var frame = 0;
    var fps = 0;
    var period = Math.floor(1000 / 60);
    var nextTime = 0;
    var lastCount = 0;

    var frameCount = 0;

    /**
    *  FUNCTION DEFINITIONS
    */
    function loop(time) {
        if (coreLoops) {
            requestAnimationFrame(loop);
            if (time <= Loop.time + period) {
                return;
            }
            Loop.time = Math.floor(time / period) * period;
            for (var i = 0; coreLoops && i < coreLoops.length; i++) {
                coreLoops[i]();
            }
            frameCount++;
            if (time - lastCount > 1000) {
                fps = frameCount;
                frameCount = 0;
                lastCount = time;
            }
        }
    }

    function addLoop(callback) {
        if (coreLoops === null) {
            coreLoops = [];
            beginLoop();
        }
        coreLoops.push(callback);
    }

    function removeLoop(callback) {
        if (coreLoops) {
            var index = coreLoops.indexOf(callback);
            coreLoops.splice(index, 1);
            if (coreLoops.length === 0) {
                coreLoops = null;
            }
        }
    }

    function beginLoop() {
        loop(0);
    }

    function loopTime() {
        return performance.now() - Loop.time;
    }

    function destroyEverything() {
        coreLoops = null;
        frame = 0;
        fps = 0;
        period = Math.floor(1000 / 60);
        nextTime = 0;
        lastCount = 0;
        frameCount = 0;
    }

    /**
    *  PUBLIC DECLARATIONS
    */
    function Loop() {}

    Loop.addLoop = addLoop;
    Loop.removeLoop = removeLoop;
    Utils.onDestroy(Loop);

    Object.defineProperty(Loop, "fps", {
        enumerable: false,
        configurable: false,
        get: function get() {
            return fps;
        },
        set: function set(value) {
            period = Math.floor(1000 / value);
        }
    });

    /**
    *   PROCESSES
    */
    Loop.time = 0;

    return Loop;
});
//# sourceMappingURL=loop.js.map;


define('gifworkerwrapper',[],function () {
    function GifWorker() {
        onmessage = function onmessage(e) {
            var frameInfo = e.data.frameInfo;
            var cData = e.data.cData;
            var header = e.data.header;
            var id = e.data.id;

            if (frameInfo && cData && header) {
                plasterPixels(frameInfo, cData, header);
            }
            postMessage({ id: id, cData: cData, frameInfo: frameInfo }, [cData.data.buffer]);
        };

        function plasterPixels(frameInfo, cData, header) {
            var img = frameInfo.img;
            var gce = frameInfo.gce;
            var transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
            var disposalMethod = gce.disposalMethod;

            var ct = img.lctFlag ? img.lct : header.gct;

            img.pixels.forEach(function (pixel, i) {
                if (transparency !== pixel) {
                    // This includes null, if no transparency was defined.
                    cData.data[i * 4] = ct[pixel][0];
                    cData.data[i * 4 + 1] = ct[pixel][1];
                    cData.data[i * 4 + 2] = ct[pixel][2];
                    cData.data[i * 4 + 3] = 255; // Opaque.
                } else if (disposalMethod === 2 || disposalMethod === 3) {
                    cData.data[i * 4 + 3] = 0; // Transparent.
                }
            });
        }
    }

    var code = GifWorker.toString();
    code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

    var blob = new Blob([code], { type: "application/javascript" });
    var worker = new Worker(URL.createObjectURL(blob));

    return worker;
});
//# sourceMappingURL=gifworkerwrapper.js.map;


define('gifHandler',['utils', 'loop', 'gifworkerwrapper'], function (Utils, Loop, gWorker) {
    'use strict';

    var gifWorker;
    var gifWorkerCallbacks = {};
    var gifs = {};

    /**
     *  CLASS DEFINITIONS
     */

    /**
     *  FUNCTION DEFINITIONS
     */
    function isGif(src) {
        return gifs[src] && gifs[src].block || src.split("?")[0].slice(-4).toLowerCase() === ".gif" || src.indexOf("data:image/gif;") === 0;
    }

    function getGif(src) {
        if (!gifs[src]) {
            gifs[src] = createGif(src);
        }
        return gifs[src];
    }

    function createGif(src) {
        var renderTime = 0;
        var currentFrame = 0;
        var maxFrameCompleted = 0;

        var gifInfo = {
            framesProcessed: 0,
            header: null,
            frameInfos: [],
            block: null,
            canvases: [],
            callbacks: [],
            processNextFrame: function processNextFrame() {
                var frame = this.framesProcessed;
                var frameInfo = this.frameInfos[frame];

                if (frameInfo && frameInfo.gce && frameInfo.img && this.header) {
                    var canvas = document.createElement("canvas");
                    canvas.style.position = "absolute";
                    canvas.style.left = 0;
                    canvas.style.top = 0;
                    canvas.width = this.header.width;
                    canvas.height = this.header.height;
                    var ctx = canvas.getContext("2d");
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;

                    this.canvases[frame] = canvas;
                    if (frame > 0) {
                        //  copy previous frame. That's how gifs work
                        ctx.drawImage(this.canvases[frame - 1], 0, 0);
                    }

                    var cData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    var self = this;
                    var processNext = this.processNextFrame.bind(this);
                    sendToGifWorker(frameInfo, cData, this.header, function (cData, frameInfo) {
                        ctx.putImageData(cData, 0, 0);
                        if (self.callbacks[frameInfo.frame]) {
                            self.callbacks[frameInfo.frame]();
                        }
                        maxFrameCompleted = frameInfo.frame;
                        self.frameInfos[frameInfo.frame].ready = true;
                        processNext();
                    });
                    currentFrame = this.framesProcessed;
                    this.framesProcessed++;
                    //                    document.body.appendChild(canvas);
                }
            },
            hdr: function hdr(_hdr) {
                this.header = _hdr;
            },
            gce: function gce(_gce) {
                if (this.frameInfos.length == 0 || this.frameInfos[this.frameInfos.length - 1].gce) {
                    this.frameInfos.push({
                        gce: null,
                        cycleTime: null,
                        img: null,
                        frame: this.frameInfos.length,
                        ready: false
                    });
                }
                var currentIndex = this.frameInfos.length - 1;
                this.frameInfos[currentIndex].gce = _gce;
                if (!_gce.delayTime) {
                    _gce.delayTime = 1;
                }
                this.frameInfos[currentIndex].cycleTime = _gce.delayTime * 10 + (currentIndex === 0 ? 0 : this.frameInfos[currentIndex - 1].cycleTime);
                this.processNextFrame();
            },
            img: function img(_img) {
                if (this.frameInfos.length === 0 || this.frameInfos[this.frameInfos.length - 1].img) {
                    this.frameInfos.push({});
                }
                this.frameInfos[this.frameInfos.length - 1].img = _img;
                this.processNextFrame();
            },
            getFrame: function getFrame() {
                if (this.block && Loop.time > renderTime) {
                    currentFrame = (currentFrame + 1) % this.frameInfos.length;
                    var totalAnimationTime = this.frameInfos[this.frameInfos.length - 1].cycleTime;
                    renderTime = Math.floor(Loop.time / totalAnimationTime) * totalAnimationTime + this.frameInfos[currentFrame].cycleTime;
                }
                return Math.min(currentFrame, maxFrameCompleted);
            },
            eof: function eof(block) {
                this.block = block;
                this.processNextFrame();
            }
        };

        Utils.loadAsync(src, function (content) {
            require(['https://jacklehamster.github.io/jsgif/gif.js'], function () {
                parseGIF(new Stream(content), gifInfo);
            });
        }, true);

        return gifInfo;
    }

    function initializeGifWorker() {
        gifWorker = gWorker;
        //        gifWorker = new Worker(require.toUrl("workers/gifworker.js"));
        gifWorker.onmessage = function (e) {
            gifWorkerCallbacks[e.data.id](e.data.cData, e.data.frameInfo);
            delete gifWorkerCallbacks[e.data.id];
        };
    }

    function sendToGifWorker(frameInfo, cData, header, callback) {
        if (!gifWorker) {
            initializeGifWorker();
        }
        require([' https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.7.0/js/md5.min.js'], function (md5) {
            var id = md5(Math.random() + "" + Loop.time);
            gifWorkerCallbacks[id] = callback;
            gifWorker.postMessage({
                frameInfo: frameInfo,
                cData: cData,
                header: header,
                id: id
            }, [cData.data.buffer]);
        });
    }

    function destroyEverything() {
        if (gifWorker) {
            gifWorker.terminate();
        }
        gifWorker = null;
        gifWorkerCallbacks = null;
        gifs = {};
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function GifHandler() {}

    GifHandler.getGif = getGif;
    GifHandler.isGif = isGif;
    Utils.onDestroy(destroyEverything);

    return GifHandler;
});
//# sourceMappingURL=gifhandler.js.map;


define('camera',['threejs', 'loop'], function (THREE, Loop) {
    'use strict';

    var camera;
    var camera2d = new THREE.OrthographicCamera(-innerWidth / 2, innerWidth / 2, innerHeight / 2, -innerHeight / 2, 0.1, 1000000);
    var camera3d = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000000);
    var cameraQuaternionData = {
        array: new Float32Array(4),
        forwardMovement: new THREE.Vector3(0, 0, 1),
        version: 0
    },
        lastQuat = new THREE.Quaternion(),
        tempQuat = new THREE.Quaternion(),
        tempQuatArray = new Float32Array(4),
        upVector = new THREE.Vector3(0, 1, 0);
    var groundQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    /**
     *  FUNCTION DEFINITIONS
     */
    function getCamera() {
        return camera;
    }

    function nop() {}

    function setCamera3d(value) {
        if (value && camera !== camera3d) {
            camera = camera3d;
            copyCamera(camera2d, camera);
        } else if (!value && camera === camera3d) {
            camera = camera2d;
            copyCamera(camera3d, camera);
        }
        updateQuaternionData();
    }

    function updateQuaternionData() {
        camera.quaternion.toArray(cameraQuaternionData.array);
        cameraQuaternionData.forwardMovement.set(0, 0, 1);
        cameraQuaternionData.forwardMovement.applyQuaternion(camera.quaternion);
    }

    function getCameraQuaternionData() {
        if (!camera.quaternion.equals(lastQuat)) {
            updateQuaternionData();
            lastQuat.copy(camera.quaternion);
        }
        return cameraQuaternionData;
    }

    function initCameras() {
        camera2d.position.set(0, 0, 400);
        camera3d.position.set(0, 0, 400);
    }

    function isCamera3d() {
        return camera === camera3d;
    }

    function copyCamera(from, to) {
        to.position.copy(from.position);
        to.quaternion.copy(from.quaternion);
    }

    function getCameraPosition() {
        return {
            'is3d': isCamera3d(),
            'position': camera.position.toArray(),
            'quaternion': camera.quaternion.toArray()
        };
    }

    function setCameraPosition(data) {
        setCamera3d(data.is3d);
        camera.quaternion.fromArray(data.quaternion);
        camera.position.fromArray(data.position);
        camera.updateProjectionMatrix();
    }

    function shadowQuatArray(x, y) {
        var angle = -Math.atan2(y - camera.position.z, x - camera.position.x) - Math.PI / 2;
        tempQuat.setFromAxisAngle(upVector, angle);
        tempQuat.multiply(groundQuat);
        return tempQuat.toArray(tempQuatArray);
    }

    function quaternionArrays() {
        var quaternions = {};
        quaternions.groundQuaternionArray = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2).toArray(new Float32Array(4));
        quaternions.southQuaternionArray = new THREE.Quaternion().toArray(new Float32Array(4));
        quaternions.northQuaternionArray = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI).toArray(new Float32Array(4));
        quaternions.westQuaternionArray = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2).toArray(new Float32Array(4));
        quaternions.eastQuaternionArray = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2).toArray(new Float32Array(4));
        quaternions.ceilingQuaternionArray = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2).toArray(new Float32Array(4));
        return quaternions;
    }

    function checkWindowSize() {
        var gameWidth = innerWidth;
        var gameHeight = innerHeight;
        camera2d.left = -gameWidth / 2;
        camera2d.right = gameWidth / 2;
        camera2d.top = gameHeight / 2;
        camera2d.bottom = -gameHeight / 2;
        camera2d.updateProjectionMatrix();
        camera3d.aspect = gameWidth / gameHeight;
        camera3d.updateProjectionMatrix();
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Camera() {}

    Camera.setCamera3d = setCamera3d;
    Camera.isCamera3d = isCamera3d;
    Camera.getCamera = getCamera;
    Camera.setCameraPosition = setCameraPosition;
    Camera.getCameraPosition = getCameraPosition;
    Camera.getCameraQuaternionData = getCameraQuaternionData;
    Camera.shadowQuatArray = shadowQuatArray;
    Camera.quaternions = quaternionArrays();

    /**
     *   PROCESSES
     */
    initCameras();
    setCamera3d(true);

    Loop.addLoop(checkWindowSize);

    return Camera;
});
//# sourceMappingURL=camera.js.map;


define('objectpool',['utils'], function (Utils) {

    /**
     *  CLASS DEFINITIONS
     */
    function ObjectPool(classObject) {
        this.pool = [];
        this.classObject = classObject;
    }
    ObjectPool.prototype.classObject = null;
    ObjectPool.prototype.pool = null;
    ObjectPool.prototype.index = 0;
    ObjectPool.prototype.create = create;
    ObjectPool.prototype.recycleAll = recycleAll;

    /**
     *  FUNCTION DEFINITIONS
     */
    function create() {
        if (this.index >= this.pool.length) {
            this.pool.push(new this.classObject());
        }
        return this.pool[this.index++];
    }

    function recycleAll() {
        this.index = 0;
    }

    function pool_create(classObject) {
        if (!classObject.pool) {
            classObject.pool = new ObjectPool(classObject);
        }
        return classObject.pool.create();
    }

    function pool_recycleAll(classObject) {
        if (classObject.pool) {
            classObject.pool.recycleAll();
        }
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    ObjectPool.create = pool_create;
    ObjectPool.recycleAll = pool_recycleAll;

    return ObjectPool;
});
//# sourceMappingURL=objectpool.js.map;


define('spriteobject',['threejs', 'objectpool'], function (THREE, ObjectPool) {
    'use strict';

    function SpriteObject() {
        this.position = new THREE.Vector3();
        this.size = new Float32Array([0, 0, 1]);
        this.quaternionArray = new Float32Array(4).fill(0);
    }

    SpriteObject.prototype.init = function (x, y, z, width, height, quaternionArray, light, img) {
        this.position.set(x, y, z);
        this.size[0] = width;
        this.size[1] = height;
        this.hasQuaternionArray = quaternionArray !== null;
        if (quaternionArray) {
            this.quaternionArray.set(quaternionArray);
        }
        this.light = light;
        this.img = img;
        return this;
    };
    SpriteObject.prototype.position = null;
    SpriteObject.prototype.size = null;
    SpriteObject.prototype.hasQuaternionArray = false;
    SpriteObject.prototype.quaternionArray = null;
    SpriteObject.prototype.light = 1;
    SpriteObject.prototype.img = -1;
    SpriteObject.prototype.offset = null;

    SpriteObject.create = function (x, y, z, width, height, quaternionArray, light, img) {
        return ObjectPool.create(SpriteObject).init(x, y, z, width, height, quaternionArray, light, img);
    };

    return SpriteObject;
});
//# sourceMappingURL=spriteobject.js.map;


define('packer',['utils'], function (Utils) {

    'use strict';

    var MAX_TEXTURES = 16;
    var SPRITE_SHEET_SIZE = 2048;
    var CHUNKSIZES = 8;

    var chunks = [];

    /**
     *  FUNCTION DEFINITIONS
     */

    function doesFit(tex, x, y, width, height) {
        if (x + width > SPRITE_SHEET_SIZE || y + height > SPRITE_SHEET_SIZE) return false;

        if (chunks[tex]) {
            for (var xi = 0; xi < width; xi++) {
                if (chunks[tex][x + xi]) {
                    for (var yi = 0; yi < height; yi++) {
                        if (chunks[tex][x + xi][y + yi]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    function findSlot(canvas) {
        if (canvas.width <= 1 && canvas.height <= 1) {
            return null;
        }
        if (canvas.width > SPRITE_SHEET_SIZE || canvas.height > SPRITE_SHEET_SIZE) {
            return null;
        }
        var chunkWidth = Math.ceil(canvas.width / CHUNKSIZES);
        var chunkHeight = Math.ceil(canvas.height / CHUNKSIZES);

        for (var tex = 0; tex < MAX_TEXTURES; tex++) {
            for (var x = 0; x < SPRITE_SHEET_SIZE / CHUNKSIZES - chunkWidth; x++) {
                for (var y = 0; y < SPRITE_SHEET_SIZE / CHUNKSIZES - chunkHeight; y++) {
                    if (doesFit(tex, x, y, chunkWidth, chunkHeight)) {
                        return { tex: tex, x: x * CHUNKSIZES, y: y * CHUNKSIZES };
                    }
                }
            }
        }
        return null;
    }

    function fillSlot(tex, x, y, canvas) {
        if (!chunks[tex]) chunks[tex] = [];
        var chunkWidth = Math.ceil((canvas.width + 1) / CHUNKSIZES);
        var chunkHeight = Math.ceil((canvas.height + 1) / CHUNKSIZES);

        for (var xi = 0; xi < chunkWidth; xi++) {
            if (!chunks[tex][x / CHUNKSIZES + xi]) chunks[tex][x / CHUNKSIZES + xi] = [];
            for (var yi = 0; yi < chunkHeight; yi++) {
                chunks[tex][x / CHUNKSIZES + xi][y / CHUNKSIZES + yi] = canvas;
            }
        }
    }

    function getSlot(canvas) {
        var slot = findSlot(canvas);
        if (slot) {
            fillSlot(slot.tex, slot.x, slot.y, canvas);
        }
        return slot;
    }

    function destroyEverything() {
        chunks.length = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Packer() {}

    Packer.getSlot = getSlot;

    Utils.onDestroy(destroyEverything);

    /**
     *   PROCESSES
     */

    return Packer;
});
//# sourceMappingURL=packer.js.map;


define('gifhandler',['utils', 'loop', 'gifworkerwrapper'], function (Utils, Loop, gWorker) {
    'use strict';

    var gifWorker;
    var gifWorkerCallbacks = {};
    var gifs = {};

    /**
     *  CLASS DEFINITIONS
     */

    /**
     *  FUNCTION DEFINITIONS
     */
    function isGif(src) {
        return gifs[src] && gifs[src].block || src.split("?")[0].slice(-4).toLowerCase() === ".gif" || src.indexOf("data:image/gif;") === 0;
    }

    function getGif(src) {
        if (!gifs[src]) {
            gifs[src] = createGif(src);
        }
        return gifs[src];
    }

    function createGif(src) {
        var renderTime = 0;
        var currentFrame = 0;
        var maxFrameCompleted = 0;

        var gifInfo = {
            framesProcessed: 0,
            header: null,
            frameInfos: [],
            block: null,
            canvases: [],
            callbacks: [],
            processNextFrame: function processNextFrame() {
                var frame = this.framesProcessed;
                var frameInfo = this.frameInfos[frame];

                if (frameInfo && frameInfo.gce && frameInfo.img && this.header) {
                    var canvas = document.createElement("canvas");
                    canvas.style.position = "absolute";
                    canvas.style.left = 0;
                    canvas.style.top = 0;
                    canvas.width = this.header.width;
                    canvas.height = this.header.height;
                    var ctx = canvas.getContext("2d");
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;

                    this.canvases[frame] = canvas;
                    if (frame > 0) {
                        //  copy previous frame. That's how gifs work
                        ctx.drawImage(this.canvases[frame - 1], 0, 0);
                    }

                    var cData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    var self = this;
                    var processNext = this.processNextFrame.bind(this);
                    sendToGifWorker(frameInfo, cData, this.header, function (cData, frameInfo) {
                        ctx.putImageData(cData, 0, 0);
                        if (self.callbacks[frameInfo.frame]) {
                            self.callbacks[frameInfo.frame]();
                        }
                        maxFrameCompleted = frameInfo.frame;
                        self.frameInfos[frameInfo.frame].ready = true;
                        processNext();
                    });
                    currentFrame = this.framesProcessed;
                    this.framesProcessed++;
                    //                    document.body.appendChild(canvas);
                }
            },
            hdr: function hdr(_hdr) {
                this.header = _hdr;
            },
            gce: function gce(_gce) {
                if (this.frameInfos.length == 0 || this.frameInfos[this.frameInfos.length - 1].gce) {
                    this.frameInfos.push({
                        gce: null,
                        cycleTime: null,
                        img: null,
                        frame: this.frameInfos.length,
                        ready: false
                    });
                }
                var currentIndex = this.frameInfos.length - 1;
                this.frameInfos[currentIndex].gce = _gce;
                if (!_gce.delayTime) {
                    _gce.delayTime = 1;
                }
                this.frameInfos[currentIndex].cycleTime = _gce.delayTime * 10 + (currentIndex === 0 ? 0 : this.frameInfos[currentIndex - 1].cycleTime);
                this.processNextFrame();
            },
            img: function img(_img) {
                if (this.frameInfos.length === 0 || this.frameInfos[this.frameInfos.length - 1].img) {
                    this.frameInfos.push({});
                }
                this.frameInfos[this.frameInfos.length - 1].img = _img;
                this.processNextFrame();
            },
            getFrame: function getFrame() {
                if (this.block && Loop.time > renderTime) {
                    currentFrame = (currentFrame + 1) % this.frameInfos.length;
                    var totalAnimationTime = this.frameInfos[this.frameInfos.length - 1].cycleTime;
                    renderTime = Math.floor(Loop.time / totalAnimationTime) * totalAnimationTime + this.frameInfos[currentFrame].cycleTime;
                }
                return Math.min(currentFrame, maxFrameCompleted);
            },
            eof: function eof(block) {
                this.block = block;
                this.processNextFrame();
            }
        };

        Utils.loadAsync(src, function (content) {
            require(['https://jacklehamster.github.io/jsgif/gif.js'], function () {
                parseGIF(new Stream(content), gifInfo);
            });
        }, true);

        return gifInfo;
    }

    function initializeGifWorker() {
        gifWorker = gWorker;
        //        gifWorker = new Worker(require.toUrl("workers/gifworker.js"));
        gifWorker.onmessage = function (e) {
            gifWorkerCallbacks[e.data.id](e.data.cData, e.data.frameInfo);
            delete gifWorkerCallbacks[e.data.id];
        };
    }

    function sendToGifWorker(frameInfo, cData, header, callback) {
        if (!gifWorker) {
            initializeGifWorker();
        }
        require([' https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.7.0/js/md5.min.js'], function (md5) {
            var id = md5(Math.random() + "" + Loop.time);
            gifWorkerCallbacks[id] = callback;
            gifWorker.postMessage({
                frameInfo: frameInfo,
                cData: cData,
                header: header,
                id: id
            }, [cData.data.buffer]);
        });
    }

    function destroyEverything() {
        if (gifWorker) {
            gifWorker.terminate();
        }
        gifWorker = null;
        gifWorkerCallbacks = null;
        gifs = {};
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function GifHandler() {}

    GifHandler.getGif = getGif;
    GifHandler.isGif = isGif;
    Utils.onDestroy(destroyEverything);

    return GifHandler;
});
//# sourceMappingURL=gifhandler.js.map;


define('loader',['utils', 'loop'], function (Utils, Loop) {
    'use strict';

    var index = 0;
    var imageQueue = [];
    var loadLimit = 3;
    var loading = 0;
    var loadingBar = null;
    var visualProgress = 0;
    var onLoadCallback = null;
    var loaded = 0;
    var loadTotal = 0;

    /**
     *  FUNCTION DEFINITIONS
     */
    function setOnLoad(onLoad) {
        onLoadCallback = onLoad;
        document.body.removeChild(getLoadingBar());
    }

    function loadImage(url, onLoad) {
        var image = new Image();
        image.onload = function (event) {
            onLoad.call(image, event);
            loading--;
            loaded++;
            checkLoad();
        };
        image.crossOrigin = '';
        imageQueue.push({
            image: image,
            url: url
        });
        loadTotal++;
        checkLoad();
        return image;
    }

    function loadFile(url, onLoad) {
        loadTotal++;
        Utils.loadAsync(url, function (result) {
            loaded++;
            onLoad(result);
        });
    }

    function checkLoad() {
        while (index < imageQueue.length && loading < loadLimit) {
            imageQueue[index].image.src = imageQueue[index].url;
            index++;
            loading++;
        }
        if (index === imageQueue.length) {
            index = 0;
            imageQueue.length = 0;
            loaded = 0;
            loadTotal = 0;
        }
    }

    function getLoadingProgress() {
        return !loadTotal ? 1 : loaded / loadTotal;
    }

    function refreshLoadingBar() {
        if (loadingBar) {
            var ctx = loadingBar.getContext("2d");
            var actualProgress = getLoadingProgress();
            visualProgress = Math.max(0, visualProgress + (actualProgress - visualProgress) / 10);
            if (actualProgress >= 1) {
                visualProgress = 1;
                Loop.removeLoop(refreshLoadingBar);
            }
            ctx.fillRect(10, 10, (loadingBar.width - 20) * visualProgress, loadingBar.height - 20);

            if (actualProgress >= 1) {
                if (onLoadCallback) {
                    setTimeout(onLoadCallback, 100);
                }
            }
        }
    }

    function getLoadingBar() {
        if (!loadingBar) {
            loadingBar = document.createElement("canvas");
            loadingBar.id = "loading";
            loadingBar.width = Math.round(innerWidth * 2 * 2 / 3);
            loadingBar.height = 50;
            loadingBar.style.left = innerWidth / 2 - loadingBar.width / 4 + "px";
            loadingBar.style.top = innerHeight / 2 - loadingBar.height / 4 + "px";
            loadingBar.style.width = loadingBar.width / 2 + "px";
            loadingBar.style.height = loadingBar.height / 2 + "px";
            loadingBar.style.position = "absolute";
            loadingBar.style.backgroundColor = "white";
            loadingBar.style.border = "10px double #00DDDD";
            var ctx = loadingBar.getContext("2d");
            ctx.fillStyle = "#0066aa";
            Loop.addLoop(refreshLoadingBar);
        }
        document.body.appendChild(loadingBar);
        return loadingBar;
    }

    function destroyEverything() {
        imageQueue.length = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Loader() {}

    Loader.loadImage = loadImage;
    Loader.loadFile = loadFile;
    Loader.getLoadingProgress = getLoadingProgress;
    Loader.getLoadingBar = getLoadingBar;
    Loader.setOnLoad = setOnLoad;

    Utils.onDestroy(destroyEverything);

    return Loader;
});
//# sourceMappingURL=loader.js.map;


define('spritesheet',['threejs', 'utils', 'gifhandler', 'loader', 'packer'], function (THREE, Utils, GifHandler, Loader, Packer) {
    'use strict';

    var canvases = {};
    var cuts = {};
    var cutArray = [];
    var cutCount = 0;

    var textures = [null];
    var slots = {};
    var SPRITE_SHEET_SIZE = 2048;
    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);

    /**
     *  FUNCTION DEFINITIONS
     */
    function getCanvas(url, canCreate) {
        if (!canvases[url] && canCreate) {
            var canvas = canvases[url] = document.createElement('canvas');
            canvas.setAttribute("url", url);
            if (url.indexOf("tex-") === 0) {
                canvas.width = canvas.height = SPRITE_SHEET_SIZE;
                var index = parseInt(url.split("-").pop());
                var tex = new THREE.Texture(canvas);
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.LinearMipMapLinearFilter;
                canvas.addEventListener("update", updateTextureEvent);
                textures[index] = tex;
                canvas.setAttribute("texture", index.toString());
                canvas.style.position = "absolute";
                canvas.style.left = 0;
                canvas.style.top = 0;

                //                document.body.appendChild(canvas);
            } else {
                canvas.width = canvas.height = 1;
            }
            initCanvas(canvas);
        }
        return canvases[url];
    }

    function initCanvas(canvas) {
        var context = canvas.getContext("2d");
        context.webkitImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
    }

    function customEvent(type, detail) {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(type, false, false, detail || {});
        return evt;
    }

    function fetchCanvas(urlpipe, frame) {
        var canvas = getCanvas(frame + ":" + urlpipe.join("|"));
        if (canvas) {
            return canvas;
        }

        if (urlpipe.length > 1) {
            canvas = getCanvas(frame + ":" + urlpipe.join("|"), true);
            var subpipe = urlpipe.slice(0, urlpipe.length - 1);
            var processString = urlpipe[urlpipe.length - 1];
            var subCanvas = fetchCanvas(subpipe, frame);
            canvas.setAttribute("base-url", subCanvas.getAttribute("base-url"));
            processCanvas(subCanvas, processString, canvas);
            subCanvas.addEventListener("update", function (event) {
                var subCanvas = event.currentTarget;
                processCanvas(subCanvas, processString, canvas);
                canvas.dispatchEvent(customEvent("update"));
            });
            return canvas;
        } else {
            var url = urlpipe[0];
            canvas = getCanvas(frame + ":" + url, true);

            //  check for width x height
            var size = url.split("x");
            if (size.length === 2 && !isNaN(parseInt(size[0])) && !isNaN(parseInt(size[1]))) {
                canvas.width = parseInt(size[0]);
                canvas.height = parseInt(size[1]);
            } else if (GifHandler.isGif(url)) {
                var gif = GifHandler.getGif(url);
                canvas.setAttribute("animated", true);
                canvas.setAttribute("base-url", url);
                if (gif.frameInfos[frame] && gif.frameInfos[frame].ready) {
                    drawGif(gif, frame, canvas);
                } else {
                    gif.callbacks[frame] = drawGif.bind(null, gif, frame, canvas);
                }
            } else {
                canvas.setAttribute("base-url", url);
                var image = Loader.loadImage(url, function () {
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    initCanvas(canvas);
                    canvas.getContext("2d").drawImage(image, 0, 0);
                    //                    document.body.appendChild(canvas);
                    canvas.dispatchEvent(customEvent("update"));
                });
            }
            return canvas;
        }
    }

    function drawGif(gif, frame, canvas) {
        canvas.width = gif.header.width;
        canvas.height = gif.header.height;
        initCanvas(canvas);
        canvas.getContext("2d").drawImage(gif.canvases[frame], 0, 0);
        canvas.dispatchEvent(customEvent("update"));
    }

    function processCanvas(canvas, processString, outputCanvas) {
        //  check size split
        var outputCtx = outputCanvas.getContext("2d");
        var splits = processString.split(",");
        if (splits.length === 4 && splits.every(function (num) {
            return !isNaN(num);
        })) {
            splits = splits.map(function (o) {
                return parseInt(o);
            });
            var drawWidth = Math.min(canvas.width - splits[0], splits[2]);
            var drawHeight = Math.min(canvas.height - splits[1], splits[3]);
            if (drawWidth > 0 && drawHeight > 0) {
                outputCanvas.width = drawWidth;
                outputCanvas.height = drawHeight;
                initCanvas(outputCanvas);
                outputCtx.drawImage(canvas, splits[0], splits[1], drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);
            }
        } else if (processString.indexOf("scale:") === 0) {
            if (canvas.width > 1 && canvas.height > 1) {
                var scale = processString.split(":")[1].split(",");
                outputCanvas.width = Math.ceil(canvas.width * Math.abs(scale[0]));
                outputCanvas.height = Math.ceil(canvas.height * Math.abs(scale[1 % scale.length]));
                initCanvas(outputCanvas);
                if (scale[0] < 0 || scale[1 % scale.length] < 0) {
                    var sign = [scale[0] < 0 ? -1 : 1, scale[1 % scale.length] < 0 ? -1 : 1];
                    outputCtx.translate(sign[0] < 0 ? outputCanvas.width : 0, sign[1] < 0 ? outputCanvas.height : 0);
                    outputCtx.scale(sign[0], sign[1]);
                }
                outputCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outputCanvas.width, outputCanvas.height);
                outputCtx.restore();
            }
        } else if (processString.indexOf("border") === 0) {
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            initCanvas(outputCanvas);
            var borderWidth = processString.split(":")[1] || 1;
            if (borderWidth.indexOf("%") > 0) {
                borderWidth = Math.round(parseFloat(borderWidth.split("%")[0]) / 100 * Math.min(outputCanvas.width, outputCanvas.height));
            }
            outputCtx.drawImage(canvas, 0, 0);
            outputCtx.beginPath();
            for (var i = 0; i < borderWidth; i++) {
                outputCtx.rect(i, i, canvas.width - 1 - i * 2, canvas.height - 1 - i * 2);
            }
            outputCtx.stroke();
        } else if (processString.indexOf("text:") === 0) {
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            initCanvas(outputCanvas);
            outputCtx.fillStyle = "#000000";
            outputCtx.font = '18px Comic';
            outputCtx.fillText(processString.split("text:")[1], 0, canvas.height);
        } else if (processString.indexOf("shadow") === 0) {
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            initCanvas(outputCanvas);
            var ctx = canvas.getContext("2d");
            var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < data.data.length; i += 4) {
                if (data.data[i + 3] !== 0) {
                    data.data[i] = 0;
                    data.data[i + 1] = 0;
                    data.data[i + 2] = 0;
                    data.data[i + 3] = 127;
                }
            }
            outputCtx.putImageData(data, 0, 0);
        } else if (processString.indexOf("cross") === 0) {
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            initCanvas(outputCanvas);
            outputCtx.drawImage(canvas, 0, 0);
            outputCtx.beginPath();
            outputCtx.moveTo(canvas.width / 2, 0);
            outputCtx.lineTo(canvas.width / 2, canvas.height);
            outputCtx.moveTo(0, canvas.height / 2);
            outputCtx.lineTo(canvas.width, canvas.height / 2);
            outputCtx.stroke();
        }
    }

    function getCut(index) {
        var cut = cutArray[index];
        var frame = cut && cut.animated ? GifHandler.getGif(cut.url).getFrame() : 0;
        if (cut && cut.cut[frame] && cut.cut[frame].ready) {
            return cut.cut[frame];
        }
        if (cut && cut.url) {
            cut = getCutByURL(cut.url, frame);
            return cut.cut[frame];
        }
        return null;
    }

    function getCutByURL(url, frame) {
        if (cuts[url] && cuts[url].cut[frame] && cuts[url].cut[frame].ready) {
            return cuts[url];
        }

        var canvas = fetchCanvas(url.split("|"), frame);
        var slot = Packer.getSlot(canvas);

        var cut = cuts[url];
        if (!cut) {
            cut = {
                index: cutCount++,
                url: url,
                baseUrl: null,
                cut: [],
                animated: false
            };
            cuts[url] = cut;
            cutArray[cut.index] = cut;
        }
        if (!cut.cut[frame]) {
            cut.cut[frame] = {
                tex: 0, uv: null, ready: false,
                url: url, baseUrl: null
            };
        }

        if (slot) {
            slots[canvas.getAttribute("url")] = slot;
            canvas.addEventListener("update", updateSpritesheetEvent);
            canvas.dispatchEvent(customEvent("update"));

            var uvX = slot.x / SPRITE_SHEET_SIZE;
            var uvY = slot.y / SPRITE_SHEET_SIZE;
            var uvW = canvas.width / SPRITE_SHEET_SIZE;
            var uvH = canvas.height / SPRITE_SHEET_SIZE;
            var uvOrder = planeGeometry.attributes.uv.array;

            var cutcut = [uvX, 1 - uvY - uvH, uvX + uvW, 1 - uvY];

            cut.animated = canvas.getAttribute("animated") === "true";
            cut.cut[frame].baseUrl = cut.baseUrl = canvas.getAttribute("base-url");
            cut.cut[frame].tex = slot.tex;
            cut.cut[frame].uv = new Float32Array(uvOrder.length);
            for (var u = 0; u < uvOrder.length; u++) {
                cut.cut[frame].uv[u] = cutcut[uvOrder[u] * 2 + u % 2];
            }
            cut.cut[frame].ready = true;
            //            console.log(canvas);
            return cut;
        } else {
            return cut;
        }
    }

    function preLoad(images, root) {
        if (root === undefined) {
            root = SpriteSheet.spritesheet;
        }
        if (typeof images === "string") {
            var cut = getCutByURL(images, 0);
            if (cut) {
                return cut.index;
            }
        } else {
            for (var prop in images) {
                if (images.hasOwnProperty(prop)) {
                    if (!root[prop]) {
                        root[prop] = [];
                    }
                    var index = SpriteSheet.preLoad(images[prop], root[prop]);
                    if (index !== null) {
                        root[prop] = index;
                    }
                }
            }
            console.log(root);
            return root;
        }
    }

    function updateSpritesheetEvent(event) {
        var canvas = event.currentTarget;
        var url = canvas.getAttribute("url");
        var slot = slots[url];
        var spritesheet = getCanvas("tex-" + slot.tex, true);
        spritesheet.getContext("2d").drawImage(canvas, slot.x, slot.y);
        spritesheet.dispatchEvent(customEvent("update"));
    }

    function updateTextureEvent(event) {
        var canvas = event.currentTarget;
        textures[parseInt(canvas.getAttribute("texture"))].needsUpdate = true;
    }

    function destroyEverything() {
        textures.forEach(function (tex) {
            if (tex) tex.dispose();
        });
        canvases = {};
        cuts = {};
        slots = {};
        textures = [null];
    }

    function getTextures() {
        return textures;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function SpriteSheet() {}

    SpriteSheet.getCut = getCut;
    SpriteSheet.getTextures = getTextures;
    SpriteSheet.preLoad = preLoad;
    SpriteSheet.fetchCanvas = fetchCanvas;
    SpriteSheet.spritesheet = {};

    Utils.onDestroy(destroyEverything);

    return SpriteSheet;
});
//# sourceMappingURL=spritesheet.js.map;


define('turbosort',[],function () {

    var buckets;
    var counts;
    var SIZE = 1000;
    var indexFunction;

    /**
     *  FUNCTION DEFINITIONS
     */
    function initArray(size) {
        if (!buckets) {
            buckets = new Uint32Array(size + 1);
            counts = new Uint32Array(size + 1);
        }
    }

    function getMinMax(array, offset, length) {
        var firstIndex = indexFunction(array[offset]);
        var minNum = firstIndex;
        var maxNum = firstIndex;
        var previousNum = firstIndex;
        var inOrder = true;
        for (var i = 1; i < length; i++) {
            var index = indexFunction(array[offset + i]);
            if (previousNum > index) {
                inOrder = false;
                if (index < minNum) {
                    minNum = index;
                }
            } else {
                if (index > maxNum) {
                    maxNum = index;
                }
            }
            previousNum = index;
        }
        getMinMax.result.min = minNum;
        getMinMax.result.max = maxNum;
        getMinMax.result.inOrder = inOrder;
        return getMinMax.result;
    }
    getMinMax.result = {
        min: 0,
        max: 0,
        inOrder: false
    };

    function identity(a) {
        return a;
    }

    function turboSort(array, size, func) {
        if (array) {
            size = size ? Math.min(size, array.length) : array.length;
            if (size > 1) {
                indexFunction = func ? func : identity;
                turboSortHelper(array, 0, size ? size : array.length);
            }
        }
    }

    function quickSort(array, size) {
        quickSortHelper(array, 0, size ? size - 1 : array.length - 1, compareIndex);
    }

    function compareIndex(a, b) {
        return indexFunction(a) - indexFunction(b);
    }

    function turboSortHelper(array, offset, length) {
        if (length < 500) {
            quickSortHelper(array, offset, offset + length - 1, compareIndex);
            return;
        }
        var arrayInfo = getMinMax(array, offset, length);
        if (arrayInfo.inOrder) {
            return;
        }
        var min = arrayInfo.min;
        var max = arrayInfo.max;
        var range = max - min;
        if (range === 0) {
            return;
        }

        var i, index;
        counts.fill(0);
        counts[SIZE] = 1;
        for (i = 0; i < length; i++) {
            index = Math.floor((SIZE - 1) * (indexFunction(array[i + offset]) - min) / range);
            counts[index]++;
        }

        buckets.fill(0);
        buckets[SIZE] = length;
        buckets[0] = offset;
        for (i = 1; i < SIZE; i++) {
            buckets[i] = buckets[i - 1] + counts[i - 1];
        }

        var voyager = offset,
            bucketId = 0;
        while (bucketId < SIZE) {
            index = Math.floor((SIZE - 1) * (indexFunction(array[voyager]) - min) / range);
            var newSpot = buckets[index] + --counts[index];
            swap(array, voyager, newSpot);
            while (!counts[bucketId]) {
                bucketId++;
            }
            voyager = buckets[bucketId];
        }
        for (i = 0; i < SIZE; i++) {
            counts[i] = buckets[i + 1] - buckets[i];
        }
        for (i = 0; i < SIZE; i++) {
            if (counts[i] > 1) {
                turboSortHelper(array, buckets[i], counts[i]);
            }
        }
    }

    function swap(array, a, b) {
        if (a !== b) {
            var temp = array[a];
            array[a] = array[b];
            array[b] = temp;
        }
    }

    function quickSortHelper(arr, left, right, compare) {
        var len = arr.length,
            pivot,
            partitionIndex;

        if (left < right) {
            pivot = right;
            partitionIndex = partition(arr, pivot, left, right, compare);

            //sort left and right
            quickSortHelper(arr, left, partitionIndex - 1, compare);
            quickSortHelper(arr, partitionIndex + 1, right, compare);
        }
        return arr;
    }

    function partition(arr, pivot, left, right, compare) {
        var pivotValue = arr[pivot],
            partitionIndex = left;

        for (var i = left; i < right; i++) {
            if (compare(arr[i], pivotValue) < 0) {
                swap(arr, i, partitionIndex);
                partitionIndex++;
            }
        }
        swap(arr, right, partitionIndex);
        return partitionIndex;
    }

    /**
     *   PROCESSES
     */
    initArray(SIZE);

    return turboSort;
});
//# sourceMappingURL=turbosort.js.map;


define('spriterenderer',['threejs', 'utils', 'spriteobject', 'spritesheet', 'objectpool', 'camera', 'turbosort'], function (THREE, Utils, SpriteObject, SpriteSheet, ObjectPool, Camera, turboSort) {
    'use strict';

    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    var pointCount = planeGeometry.attributes.position.count;
    var indices = planeGeometry.index.array;
    var spriteRenderers = [];
    var uniforms = null;
    var indexProcessor = function indexProcessor() {};

    /**
     *  CLASS DEFINITIONS
     */

    function SpriteRenderer() {
        this.images = [];
        this.imageOrder = [];
        this.imageCount = 0;
        this.mesh = createMesh();

        var self = this;

        this.display = function (spriteObject) {
            var image = null;
            var cut = spriteObject && spriteObject.visible !== false ? SpriteSheet.getCut(spriteObject.img) : null;
            if (cut && cut.ready) {
                var index = self.imageCount;
                if (!self.images[index]) {
                    self.images[index] = new SpriteImage();
                    self.images[index].index = index;
                }

                image = self.images[index];

                for (var j = 0; j < indices.length; j++) {
                    image.indexArray[j] = indices[j] + image.index * 4;
                }

                var quat = spriteObject.hasQuaternionArray ? spriteObject.quaternionArray : Camera.getCameraQuaternionData().array;
                if (image.quaternionArray[0] !== quat[0] || image.quaternionArray[1] !== quat[1] || image.quaternionArray[2] !== quat[2] || image.quaternionArray[3] !== quat[3]) {
                    image.quaternionArray.set(quat);
                    image.quaternionArray.set(quat, 4);
                    image.quaternionArray.set(quat, 8);
                    image.quaternionArray.set(quat, 12);
                    image.quatDirty = true;
                }

                if (!spriteObject.position.equals(image.position)) {
                    image.position.copy(spriteObject.position);
                    image.position.toArray(image.spotArray);
                    image.position.toArray(image.spotArray, 3);
                    image.position.toArray(image.spotArray, 6);
                    image.position.toArray(image.spotArray, 9);
                    image.positionDirty = true;
                }

                if (spriteObject.size[0] !== image.size[0] || spriteObject.size[1] !== image.size[1] || spriteObject.size[2] !== image.size[2] || image.positionDirty) {
                    image.size[0] = spriteObject.size[0];
                    image.size[1] = spriteObject.size[1];
                    image.size[2] = spriteObject.size[2];
                    var vertices = planeGeometry.attributes.position.array;
                    for (var v = 0; v < vertices.length; v++) {
                        image.vertices[v] = vertices[v] * spriteObject.size[v % 3] + image.spotArray[v];
                    }
                    image.verticesDirty = true;
                }

                if (image.uv !== cut.uv) {
                    image.uv = cut.uv;
                    image.uvDirty = true;
                }

                if (image.tex !== cut.tex) {
                    image.tex = cut.tex;
                    image.texDirty = true;
                }

                if (image.light !== spriteObject.light) {
                    image.light = spriteObject.light;
                    image.lightDirty = true;
                }
                image.spriteObject = spriteObject;
                self.imageOrder[index] = image;
                self.imageCount++;
            }
            return image;
        };

        spriteRenderers.push(this);
    }

    SpriteRenderer.prototype.destroy = destroySprite;
    SpriteRenderer.prototype.render = render;
    SpriteRenderer.prototype.updateGraphics = updateGraphics;
    SpriteRenderer.prototype.clear = clear;

    function SpriteImage() {
        this.position = new THREE.Vector3();
        this.spotArray = new Float32Array(3 * pointCount);
        this.size = new Float32Array(3);
        this.vertices = new Float32Array(planeGeometry.attributes.position.array.length);
        this.quaternionArray = new Float32Array(4 * pointCount);
        this.indexArray = new Uint16Array(indices.length);
    }
    SpriteImage.prototype.index = 0;
    SpriteImage.prototype.position = null;
    SpriteImage.prototype.spotArray = null;
    SpriteImage.prototype.indexArray = null;
    SpriteImage.prototype.tex = -1;
    SpriteImage.prototype.size = null;
    SpriteImage.prototype.uv = null;
    SpriteImage.prototype.vertices = null;
    SpriteImage.prototype.light = 1;
    SpriteImage.prototype.zIndex = 0;
    SpriteImage.prototype.quaternionArray = null;
    SpriteImage.prototype.positionDirty = true;
    SpriteImage.prototype.verticesDirty = true;
    SpriteImage.prototype.texDirty = true;
    SpriteImage.prototype.uvDirty = true;
    SpriteImage.prototype.lightDirty = true;
    SpriteImage.prototype.quatDirty = true;
    SpriteImage.prototype.spriteObject = null;

    /**
     *  FUNCTION DEFINITIONS
     */

    function clear() {
        this.imageCount = 0;
        ObjectPool.recycleAll(SpriteObject);
    }

    function createMesh() {
        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array([-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0]);
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

        Utils.loadAsync(['https://jacklehamster.github.io/dok/glsl/vertex-shader.glsl', 'https://jacklehamster.github.io/dok/glsl/fragment-shader.glsl', 'https://jacklehamster.github.io/dok/glsl/vertex-shader-common.glsl'], function (vertexShader, fragmentShader, vertexShaderCommon) {
            mesh.material = new THREE.ShaderMaterial({
                uniforms: uniforms = {
                    texture: {
                        type: 'tv',
                        get value() {
                            return SpriteSheet.getTextures();
                        }
                    },
                    vCam: {
                        type: "v3",
                        get value() {
                            return Camera.getCamera().position;
                        }
                    }
                },
                vertexShader: vertexShaderCommon + vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                depthWrite: false,
                depthTest: true
            });
        });

        mesh.frustumCulled = false;
        return mesh;
    }

    function sortImages(images, count) {
        var camera = Camera.getCamera();
        for (var i = 0; i < count; i++) {
            images[i].zIndex = -camera.position.distanceToManhattan(images[i].position);
        }
        indexProcessor(images, count);
        turboSort(images, count, indexFunction);
    }

    function setIndexProcessor(fun) {
        indexProcessor = fun ? fun : function () {};
    }

    function indexFunction(a) {
        return a.zIndex;
    }

    function render() {
        var imageCount = this.imageCount;
        var pointCount = planeGeometry.attributes.position.count;
        var previousAttribute;

        var mesh = this.mesh;
        var geometry = mesh.geometry;
        if (!geometry.attributes.position || geometry.attributes.position.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.position;
            geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(imageCount * pointCount * 3), 3);
            if (previousAttribute) geometry.attributes.position.copyArray(previousAttribute.array);
            geometry.attributes.position.setDynamic(true);
        }
        if (!geometry.attributes.spot || geometry.attributes.spot.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.spot;
            geometry.attributes.spot = new THREE.BufferAttribute(new Float32Array(imageCount * pointCount * 3), 3);
            if (previousAttribute) geometry.attributes.spot.copyArray(previousAttribute.array);
            geometry.attributes.spot.setDynamic(true);
        }
        if (!geometry.attributes.quaternion || geometry.attributes.quaternion.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.quaternion;
            geometry.attributes.quaternion = new THREE.BufferAttribute(new Float32Array(imageCount * pointCount * 4), 4);
            if (previousAttribute) geometry.attributes.quaternion.copyArray(previousAttribute.array);
            geometry.attributes.quaternion.setDynamic(true);
        }
        if (!geometry.attributes.uv || geometry.attributes.uv.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.uv;
            geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(imageCount * pointCount * 2), 2);
            if (previousAttribute) geometry.attributes.uv.copyArray(previousAttribute.array);
            geometry.attributes.uv.setDynamic(true);
        }
        if (!geometry.attributes.tex || geometry.attributes.tex.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.tex;
            geometry.attributes.tex = new THREE.BufferAttribute(new Float32Array(imageCount * pointCount), 1);
            if (previousAttribute) geometry.attributes.tex.copyArray(previousAttribute.array);
            geometry.attributes.tex.setDynamic(true);
        }
        if (!geometry.attributes.light || geometry.attributes.light.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.light;
            geometry.attributes.light = new THREE.BufferAttribute(new Float32Array(imageCount * pointCount), 1);
            if (previousAttribute) geometry.attributes.light.copyArray(previousAttribute.array);
            geometry.attributes.light.setDynamic(true);
        }
        if (!geometry.index || geometry.index.count < imageCount * planeGeometry.index.array.length) {
            previousAttribute = geometry.index;
            var indices = planeGeometry.index.array;
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            if (previousAttribute) geometry.index.copyArray(previousAttribute.array);
            geometry.index.setDynamic(true);
        }

        sortImages(this.imageOrder, imageCount);
    }

    function updateGraphics() {
        this.render();

        var images = this.images;
        var imageOrder = this.imageOrder;
        var imageCount = this.imageCount;
        var geometry = this.mesh.geometry;
        var geo_quaternion = geometry.attributes.quaternion.array;
        var geo_spot = geometry.attributes.spot.array;
        var geo_pos = geometry.attributes.position.array;
        var geo_tex = geometry.attributes.tex.array;
        var geo_light = geometry.attributes.light.array;
        var geo_uv = geometry.attributes.uv.array;
        var geo_index = geometry.index.array;

        var quatChanged = false;
        var positionChanged = false;
        var texChanged = false;
        var verticesChanged = false;
        var uvChanged = false;
        var lightChanged = false;

        for (var i = 0; i < imageCount; i++) {
            var image = images[i];
            var index = image.index;

            if (image.quatDirty) {
                var quaternionArray = image.quaternionArray;
                geo_quaternion.set(quaternionArray, index * 16);
                image.quatDirty = false;
                quatChanged = true;
            }

            if (image.positionDirty) {
                geo_spot.set(image.spotArray, index * 12);
                image.positionDirty = false;
                positionChanged = true;
            }

            if (image.verticesDirty) {
                geo_pos.set(image.vertices, index * 12);
                image.verticesDirty = false;
                verticesChanged = true;
            }

            if (image.uvDirty) {
                geo_uv.set(image.uv, index * 8);
                image.uvDirty = false;
                uvChanged = true;
            }

            if (image.texDirty) {
                geo_tex.fill(image.tex, index * 4, index * 4 + 4);
                image.texDirty = false;
                texChanged = true;
            }

            if (image.lightDirty) {
                geo_light.fill(image.light, index * 4, index * 4 + 4);
                image.lightDirty = false;
                lightChanged = true;
            }
        }

        for (i = 0; i < imageCount; i++) {
            geo_index.set(imageOrder[i].indexArray, i * 6);
        }

        if (geometry.drawRange.start !== 0 || geometry.drawRange.count !== imageCount * planeGeometry.index.count) {
            geometry.setDrawRange(0, imageCount * planeGeometry.index.count);
        }

        if (lightChanged) {
            geometry.attributes.light.needsUpdate = true;
        }
        if (quatChanged) {
            geometry.attributes.quaternion.needsUpdate = true;
        }
        if (positionChanged) {
            geometry.attributes.spot.needsUpdate = true;
        }
        if (verticesChanged) {
            geometry.attributes.position.needsUpdate = true;
        }
        if (texChanged) {
            geometry.attributes.tex.needsUpdate = true;
        }
        if (uvChanged) {
            geometry.attributes.uv.needsUpdate = true;
        }
        geometry.index.needsUpdate = true;
        this.clear();
    }

    function destroyEverything() {
        for (var i = 0; i < spriteRenderers.length; i++) {
            spriteRenderers[i].destroy();
        }
        spriteRenderers.length = 0;
    }

    function destroySprite() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.mesh = null;
        this.images.length = 0;
        this.imageCount = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    SpriteRenderer.setIndexProcessor = setIndexProcessor;
    Utils.onDestroy(destroyEverything);

    /**
     *   PROCESSES
     */

    return SpriteRenderer;
});
//# sourceMappingURL=spriterenderer.js.map;


define('collection',['utils', 'spritesheet', 'spriteobject', 'camera'], function (Utils, SpriteSheet, SpriteObject, Camera) {

    'use strict';

    function nop() {}

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : nop;
        if (forEach) {
            this.forEach = forEach.bind(this);
        } else {
            switch (this.options.type) {
                case "grid":
                    this.forEach = Grid_forEach.bind(this);
                    break;
                default:
                    Utils.handleError('Collection type not recognized');
                    break;
            }
        }
    }
    Collection.prototype.pos = null;
    Collection.prototype.size = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.forEach = nop;
    Collection.prototype.options = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.isCollection = true;

    /**
     *  FUNCTION DEFINITIONS
     */
    function Grid_forEach(callback) {
        var count = this.options.count || 1;
        var gridCount = this.options.width * this.options.height;
        var length = gridCount * count;
        for (var i = 0; i < length; i++) {
            var x = this.options.x + i % this.options.width;
            var y = this.options.y + Math.floor(i / this.options.width) % this.options.height;
            var c = Math.floor(i / gridCount);
            var obj = this.getSprite(x, y, c);
            if (obj) {
                if (obj.forEach) {
                    obj.forEach(callback);
                } else {
                    callback(obj);
                }
            }
        }
    }

    function destroyEverything() {}

    function spriteFace(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = cellSize;
        var light = 1;
        var img = SpriteSheet.spritesheet.sprite[index];

        return SpriteObject.create().init(x * cellSize, y * cellSize, size / 2, size, size, null, light, img);
    }

    var cubeFaces = [];
    function spriteCube(spriteInfo) {
        cubeFaces.length = 0;

        cube.faces.push(SpriteObject.create().init(x * cellSize, y * cellSize, size / 2, size, size, Camera.quaternions.southQuaternionArray, light, img));

        return cubeFaces;
    }

    function createSpriteCollection(options) {
        var spriteMap = [];
        var areaSize = 50;
        var spriteRegistry = {};
        var cellSize = 64;

        var spriteFunction = function spriteFunction(spriteInfo) {
            switch (spriteInfo.type) {
                case 'face':
                    return spriteFace(spriteInfo);
                    break;
                case 'cube':
                    return spriteCube(spriteInfo);
                    break;
            }
        };
        if (options.spriteFunction) {
            spriteFunction = options.spriteFunction;
        }

        var spriteCount = 0;
        function SpriteInfo(x, y, index) {
            this.uid = 'uid' + spriteCount++;
            spriteRegistry[this.uid] = this;
            this.index = index;
            this.enterArea(x, y);
        }
        SpriteInfo.prototype.leaveArea = function () {
            var areaId = getAreaId(this.x, this.y);
            var area = spriteMap[areaId];
            if (area) {
                var posId = Math.floor(this.x) + "_" + Math.floor(this.y);
                if (area[posId]) delete area[posId][this.uid];
            }
        };
        SpriteInfo.prototype.enterArea = function (x, y) {
            this.x = x;this.y = y;
            var areaId = getAreaId(this.x, this.y);
            var area = spriteMap[areaId] || (spriteMap[areaId] = {});
            var posId = Math.floor(this.x) + "_" + Math.floor(this.y);
            area[posId] = area[posId] || (area[posId] = {});
            area[posId][this.uid] = this;
        };
        SpriteInfo.prototype.move = function (x, y) {
            this.leaveArea();
            this.enterArea(x, y);
        };

        function getAreaId(x, y) {
            x = Math.floor(x / areaSize);
            y = Math.floor(y / areaSize);
            return x + "_" + y;
        }

        var selectedObj = { x: 0, y: 0 };
        function getCamPos() {
            var cellSize = 64;
            var camera = Camera.getCamera();
            var xPos = camera.position.x;
            var yPos = camera.position.y;

            selectedObj.x = Math.round(xPos / cellSize);
            selectedObj.y = Math.round(yPos / cellSize) + 6;
            return selectedObj;
        }

        var spriteCollection = new Collection(options, spriteFunction, function (callback) {
            var camPos = getCamPos();
            var xArea = Math.floor(camPos.x / areaSize);
            var yArea = Math.floor(camPos.y / areaSize);
            var range = 1;
            for (var y = yArea - range; y <= yArea + range; y++) {
                for (var x = xArea - range; x <= xArea + range; x++) {
                    var area = spriteMap[x + "_" + y];
                    if (area) {
                        for (var a in area) {
                            var sprites = area[a];
                            for (var s in sprites) {
                                var obj = this.getSprite(sprites[s]);
                                if (Array.isArray(obj)) {
                                    obj.forEach(callback);
                                } else {
                                    callback(obj);
                                }
                            }
                        }
                    }
                }
            }
        });
        spriteCollection.create = function (x, y, index) {
            return new SpriteInfo(x, y, index);
        };

        spriteCollection.get = function (x, y) {
            var areaId = getAreaId(x, y);
            var area = spriteMap[areaId];
            var posId = Math.floor(x) + "_" + Math.floor(y);
            return area ? area[posId] : null;
        };
        spriteCollection.find = function (uid) {
            return spriteRegistry[uid];
        };
        return spriteCollection;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    Collection.createSpriteCollection = createSpriteCollection;

    /**
     *   PROCESSES
     */
    Utils.onDestroy(destroyEverything);

    return Collection;
});
//# sourceMappingURL=collection.js.map;


define('mouse',['utils'], function (Utils) {

    'use strict';

    var spot = { x: 0, y: 0 },
        callbacks = [];
    var touchSpotX = {},
        touchSpotY = {};
    var mdown = false;

    /**
     *  FUNCTION DEFINITIONS
     */
    function onDown(e) {
        if (e.target.attributes['tap'] === undefined) {
            var touches = e.changedTouches;
            if (touches) {
                for (var i = 0; i < touches.length; i++) {
                    var touch = touches[i];
                    touchSpotX[touch.identifier] = touch.pageX;
                    touchSpotY[touch.identifier] = touch.pageY;
                }
            } else {
                spot.x = e.pageX;
                spot.y = e.pageY;
            }
            mdown = true;
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](null, null, true, e.pageX, e.pageY);
            }
        }
        e.preventDefault();
    }

    function onUp(e) {

        var hasTouch = false;
        if (e.changedTouches) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                delete touchSpotX[touch.identifier];
                delete touchSpotY[touch.identifier];
            }
            for (var i in touchSpotX) {
                hasTouch = true;
            }
        }

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](null, null, hasTouch, e.pageX, e.pageY);
        }
        mdown = false;
        e.preventDefault();
    }

    function onMove(e) {
        e = e || event;
        var touches = e.changedTouches;
        if (!touches) {
            var buttonDown = 'buttons' in e && e.buttons === 1 || (e.which || e.button) === 1;

            if (buttonDown && mdown) {
                var newX = e.pageX;
                var newY = e.pageY;
                var dx = newX - spot.x;
                var dy = newY - spot.y;
                spot.x = newX;
                spot.y = newY;
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](dx, dy, true, e.pageX, e.pageY);
                }
            } else {
                mdown = false;
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](dx, dy, false, e.pageX, e.pageY);
                }
            }
        } else if (mdown) {
            var dx = 0,
                dy = 0;
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                dx += touch.pageX - touchSpotX[touch.identifier];
                dy += touch.pageY - touchSpotY[touch.identifier];
                touchSpotX[touch.identifier] = touch.pageX;
                touchSpotY[touch.identifier] = touch.pageY;
            }
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](dx, dy, true, e.pageX, e.pageY);
            }
        }
        e.preventDefault();
    }

    function setOnTouch(func) {
        deactivateTouch();
        activateTouch();
        callbacks.push(func);
    }

    function activateTouch() {

        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchend", onUp);
        document.addEventListener("touchcancel", onUp);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove);
    }

    function deactivateTouch() {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("touchstart", onDown);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
        document.removeEventListener("touchcancel", onUp);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
    }

    function destroyEverything() {
        callbacks = [];
        deactivateTouch();
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Mouse() {}
    Mouse.setOnTouch = setOnTouch;

    Utils.onDestroy(destroyEverything);

    return Mouse;
});
//# sourceMappingURL=mouse.js.map;


define('dobuki',['utils', 'loop', 'gifHandler', 'camera', 'objectpool', 'spriteobject', 'packer', 'spritesheet', 'spriterenderer', 'collection', 'mouse', 'loader'], function (Utils, Loop, GifHandler, Camera, ObjectPool, SpriteObject, Packer, SpriteSheet, SpriteRenderer, Collection, Mouse, Loader) {

    return {
        Utils: Utils,
        Loop: Loop,
        GifHandler: GifHandler,
        Camera: Camera,
        ObjectPool: ObjectPool,
        SpriteObject: SpriteObject,
        SpriteSheet: SpriteSheet,
        SpriteRenderer: SpriteRenderer,
        Collection: Collection,
        Mouse: Mouse,
        Loader: Loader
    };
});
//# sourceMappingURL=dobuki.js.map;


requirejs.config({
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        dobuki: 'dobuki',
        jsgif: 'jsgif/gif'
    },
    urlArgs: location.search.match(/\bdebug\b|\bdisable_cache\b/g) ? "time=" + Date.now() : ''
});

require(["dobuki"], function (DOK) {});
//# sourceMappingURL=main.js.map;
define("main", function(){});

