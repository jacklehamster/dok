define(['utils', 'loop', 'IDGenerator'], function(Utils, Loop, IDGenerator) {
    let gifWorkerCallbacks = [];
    let generator = new IDGenerator();

    function GifWorker() {
        onmessage = function(e) {
            const frameInfo = e.data.frameInfo;
            const cData = e.data.cData;
            const header = e.data.header;
            const id = e.data.id;

            if(frameInfo && cData && header) {
                plasterPixels(frameInfo, cData, header);
            }
            postMessage({id:id, cData: cData, frameInfo: frameInfo },[cData.data.buffer]);
        };

        function plasterPixels(frameInfo, cData, header) {
            const img = frameInfo.img;
            const gce = frameInfo.gce;
            const transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
            const disposalMethod = gce.disposalMethod;

            const ct = img.lctFlag ? img.lct : header.gct;

            img.pixels.forEach(function(pixel, i) {
                if (transparency !== pixel) { // This includes null, if no transparency was defined.
                    cData.data[i * 4    ] = ct[pixel][0];
                    cData.data[i * 4 + 1] = ct[pixel][1];
                    cData.data[i * 4 + 2] = ct[pixel][2];
                    cData.data[i * 4 + 3] = 255; // Opaque.
                } else if (disposalMethod === 2 || disposalMethod === 3) {
                    cData.data[i * 4 + 3] = 0; // Transparent.
                }
            });
        }
    }

    let code = GifWorker.toString();
    code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));

    const blob = new Blob([code], {type: "application/javascript"});
    let gifWorker = new Worker(URL.createObjectURL(blob));

    function initializeGifWorker(gifWorker) {
        gifWorker.onmessage = function(e) {
            gifWorkerCallbacks[e.data.id] (e.data.cData, e.data.frameInfo);
            generator.recycle(e.data.id);
            delete gifWorkerCallbacks[e.data.id];
        }
    }

    function sendToGifWorker(frameInfo, cData, header, callback) {
        const id = generator.get();
        gifWorkerCallbacks[id] = callback;
        gifWorker.postMessage({
            frameInfo,
            cData,
            header,
            id
        }, [cData.data.buffer]);
    }


    initializeGifWorker(gifWorker);

    gifWorker.send = sendToGifWorker;

    function destroyEverything() {
        if(gifWorker) {
            gifWorker.terminate();
        }
        gifWorker = null;
        gifWorkerCallbacks = null;
        generator = null;
    }

    Utils.onDestroy(destroyEverything);

    return gifWorker;
});