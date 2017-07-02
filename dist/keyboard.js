'use strict';

define(['utils', 'loop'], function (Utils, Loop) {
    'use strict';

    var keyboard = [];

    /**
     *  FUNCTION DEFINITIONS
     */
    function destroyEverything() {
        clearListeners();
        keyboard = null;
    }

    function clearListeners() {
        document.removeEventListener("keydown", handleKey);
        document.removeEventListener("keyup", handleKey);
    }

    function addListeners() {
        document.addEventListener("keydown", handleKey);
        document.addEventListener("keyup", handleKey);
    }

    function handleKey(e) {
        var keyCode = e.keyCode;
        if (e.type === "keydown") {
            if (!keyboard[keyCode]) {
                keyboard[keyCode] = Loop.time;
            }
        } else {
            keyboard[keyCode] = 0;
        }
        //        e.preventDefault();
    }

    function keyDown(key) {
        return keyboard[key];
    }

    var mov = { x: 0, y: 0 };
    function getMove() {
        var dx = 0,
            dy = 0;
        if (keyDown(87) || keyDown(38)) {
            dy++;
        }
        if (keyDown(83) || keyDown(40)) {
            dy--;
        }
        if (keyDown(65) || keyDown(37)) {
            dx--;
        }
        if (keyDown(68) || keyDown(39)) {
            dx++;
        }
        mov.x = dx;
        mov.y = dy;
        return mov;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Keyboard() {}

    Keyboard.getMove = getMove;

    addListeners();
    Utils.onDestroy(destroyEverything);

    return Keyboard;
});
//# sourceMappingURL=keyboard.js.map