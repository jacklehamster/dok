"use strict";

define(function () {
    function IDGenerator() {
        var array = [];
        var max = 1;
        this.recycle = function (id) {
            array.push(id);
        };
        this.get = function () {
            if (array.length) {
                return array.pop();
            }
            return max++;
        };
    }
    IDGenerator.prototype.recycle = null;
    IDGenerator.prototype.get = null;
    return IDGenerator;
});
//# sourceMappingURL=IDGenerator.js.map