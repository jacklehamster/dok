"use strict";

define(function () {
    var gifWorkerCallbacks = {};

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
//# sourceMappingURL=gifworkerwrapper.js.map