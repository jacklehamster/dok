'use strict';

define(['utils', 'loop', 'gifworker'], function (Utils, Loop, gifWorker) {
    'use strict';

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
                    gifWorker.send(frameInfo, cData, this.header, function (cData, frameInfo) {
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

    function destroyEverything() {
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
//# sourceMappingURL=gifhandler.js.map