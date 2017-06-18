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
            gifs[src] = new GifImage(src);
        }
        return gifs[src];
    }

    function GifImage(src) {
        var self = this;

        var gifInfo = {
            maxFrameCompleted: 0,
            framesProcessed: 0,
            header: null,
            frameInfos: [],
            block: null,
            canvases: [],
            callbacks: [],
            frameSlot: null,
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
                    this.framesProcessed++;
//                    document.body.appendChild(canvas);
                }
            },
            hdr: function (hdr) {
                this.header = hdr;
                self.width = this.header.width;
                self.height = this.header.height;
            },
            gce: function (gce) {
                if(this.frameInfos.length===0 || this.frameInfos[this.frameInfos.length-1].gce) {
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
            eof: function(block) {
                this.block = block;
                this.processNextFrame();
            }
        };

        Utils.loadAsync(src, function(content) {
            JSGif.parseGIF(new JSGif.Stream(content), gifInfo);
        }, true);

        this.frameInfos = gifInfo.frameInfos;
        this.canvases = gifInfo.canvases;
        this.callbacks = gifInfo.callbacks;
        this.gifInfo = gifInfo;
    }
    GifImage.prototype.width = 0;
    GifImage.prototype.height = 0;
    GifImage.prototype.frameInfos = [];
    GifImage.prototype.canvases = [];
    GifImage.prototype.callbacks = [];
    GifImage.prototype.gifInfo = null;
    GifImage.prototype.getFrame = GifImage_getFrame;

    function GifImage_getFrame(time) {
        var gifInfo = this.gifInfo;

        if(gifInfo.block) {
            var totalAnimationTime = this.frameInfos[this.frameInfos.length-1].cycleTime;
            if(!gifInfo.frameSlot) {
                gifInfo.frameSlot = [];
                var cycle = 0;
                for(var frame=0; frame<this.frameInfos.length; frame++) {
                    while(gifInfo.frameSlot.length < this.frameInfos[frame].cycleTime) {
                        gifInfo.frameSlot.push(frame);
                    }
                }
            }
            var timeInCycle = Math.floor(time % totalAnimationTime);
            return gifInfo.frameSlot[timeInCycle];
        }
        return gifInfo.maxFrameCompleted;
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
