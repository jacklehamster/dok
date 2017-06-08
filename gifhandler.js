define([
    'utils',
    'loop',
    'gifworker',
    'jsgif/gif',
], function(Utils, Loop, gifWorker, JSGif) {
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
        var gifInfo = {
            currentFrame: 0,
            maxFrameCompleted: 0,
            renderTime: 0,
            framesProcessed: 0,
            header: null,
            frameInfos: [],
            block: null,
            canvases: [],
            callbacks: [],
            processNextFrame: function() {
                var frame = this.framesProcessed;
                var frameInfo = this.frameInfos[frame];

                if(frameInfo && frameInfo.gce && frameInfo.img && this.header) {
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
                    if(frame>0) { //  copy previous frame. That's how gifs work
                        ctx.drawImage(this.canvases[frame-1], 0, 0);
                    }

                    var cData = ctx.getImageData(0,0,canvas.width,canvas.height);

                    var self = this;
                    var processNext = this.processNextFrame.bind(this);
                    gifWorker.send(frameInfo, cData, this.header, function(cData, frameInfo) {
                        ctx.putImageData(cData, 0, 0);
                        if(self.callbacks[frameInfo.frame]) {
                            self.callbacks[frameInfo.frame]();
                        }
                        self.maxFrameCompleted = frameInfo.frame;
                        self.frameInfos[frameInfo.frame].ready = true;
                        processNext();
                    });
                    this.currentFrame = this.framesProcessed;
                    this.framesProcessed++;
//                    document.body.appendChild(canvas);
                }
            },
            hdr: function (hdr) {
                this.header = hdr;
            },
            gce: function (gce) {
                if(this.frameInfos.length==0 || this.frameInfos[this.frameInfos.length-1].gce) {
                    this.frameInfos.push({
                        gce:null,
                        cycleTime:null,
                        img:null,
                        frame: this.frameInfos.length,
                        ready: false,
                    });
                }
                var currentIndex = this.frameInfos.length-1;
                this.frameInfos[currentIndex].gce = gce;
                if(!gce.delayTime) {
                    gce.delayTime = 1;
                }
                this.frameInfos[currentIndex].cycleTime = gce.delayTime * 10
                    + (currentIndex === 0 ? 0 : this.frameInfos[currentIndex-1].cycleTime);
                this.processNextFrame();
            },
            img: function(img) {
                if(this.frameInfos.length===0 || this.frameInfos[this.frameInfos.length-1].img) {
                    this.frameInfos.push({});
                }
                this.frameInfos[this.frameInfos.length-1].img = img;
                this.processNextFrame();
            },
            getFrame: function() {
                if(this.block && Loop.time > this.renderTime) {
                    this.currentFrame = (this.currentFrame+1) % this.frameInfos.length;
                    var totalAnimationTime = this.frameInfos[this.frameInfos.length-1].cycleTime;
                    this.renderTime = Math.floor(Loop.time / totalAnimationTime) * totalAnimationTime
                        + this.frameInfos[this.currentFrame].cycleTime;
                }
                return Math.min(this.currentFrame,this.maxFrameCompleted);
            },
            eof: function(block) {
                this.block = block;
                this.processNextFrame();
            }
        };

        Utils.loadAsync(src, function(content) {
            JSGif.parseGIF(new JSGif.Stream(content), gifInfo);
        }, true);

        return gifInfo;
    }

    function destroyEverything() {
        gifs = {};
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function GifHandler() {
    }

    GifHandler.getGif = getGif;
    GifHandler.isGif = isGif;
    Utils.onDestroy(destroyEverything);

    return GifHandler;

 });
