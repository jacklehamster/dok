'use strict';

define(['utils'], function (Utils) {

    'use strict';

    var spot = { x: 0, y: 0 },
        callbacks = [],
        wheelCallbacks = [],
        zoomCallbacks = [];
    var touchSpotX = {},
        touchSpotY = {},
        pinchSize = 0;
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
            if (touches && touches.length === 2) {
                var dx = touches[0].pageX - touches[1].pageY;
                var dy = touches[0].pageY - touches[1].pageY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                pinchSize = dist;
            }
        }
        e.preventDefault();
    }

    function onUp(e) {

        var hasTouch = false;
        if (e.changedTouches) {
            var touches = e.changedTouches;
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
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
            var buttonDown = 'buttons' in e && e.buttons === 1 || e.button === 1;
            if (buttonDown && !mdown) {
                spot.x = e.pageX;
                spot.y = e.pageY;
                mdown = true;
            }

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
            if (zoomCallbacks.length && touches.length === 2) {
                var dx = touches[0].pageX - touches[1].pageY;
                var dy = touches[0].pageY - touches[1].pageY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var diff = dist - pinchSize;
                for (var i = 0; i < zoomCallbacks.length; i++) {
                    zoomCallbacks[i](diff);
                }
                pinchSize = dist;
            }
        }
        e.preventDefault();
    }

    function onWheel(e) {
        e = e || event;
        for (var i = 0; i < wheelCallbacks.length; i++) {
            wheelCallbacks[i](e.deltaX, e.deltaY);
        }
    }

    function setOnTouch(func) {
        deactivateTouch();
        activateTouch();
        callbacks.push(func);
    }

    function setOnWheel(func) {
        deactivateTouch();
        activateTouch();
        wheelCallbacks.push(func);
    }

    function setOnZoom(func) {
        deactivateTouch();
        activateTouch();
        zoomCallbacks.push(func);
    }

    var element = document;

    function activateTouch() {
        element.addEventListener("mousedown", onDown);
        element.addEventListener("touchstart", onDown);
        element.addEventListener("mouseup", onUp);
        element.addEventListener("touchend", onUp);
        element.addEventListener("touchcancel", onUp);
        element.addEventListener("mousemove", onMove);
        element.addEventListener("touchmove", onMove);
        element.addEventListener("wheel", onWheel);
        element.addEventListener("mouseleave", onUp);
    }

    function deactivateTouch() {
        element.removeEventListener("mousedown", onDown);
        element.removeEventListener("touchstart", onDown);
        element.removeEventListener("mouseup", onUp);
        element.removeEventListener("touchend", onUp);
        element.removeEventListener("touchcancel", onUp);
        element.removeEventListener("mousemove", onMove);
        element.removeEventListener("touchmove", onMove);
        element.removeEventListener("wheel", onWheel);
        element.removeEventListener("mouseleave", onUp);
    }

    function setMainElement(elem) {
        deactivateTouch();
        element = elem;
        activateTouch();
    }

    function destroyEverything() {
        callbacks = [];
        wheelCallbacks = [];
        zoomCallbacks = [];
        deactivateTouch();
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Mouse() {}
    Mouse.setOnTouch = setOnTouch;
    Mouse.setOnWheel = setOnWheel;
    Mouse.setOnZoom = setOnZoom;
    Mouse.setMainElement = setMainElement;

    Utils.onDestroy(destroyEverything);

    return Mouse;
});
//# sourceMappingURL=mouse.js.map