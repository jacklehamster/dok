'use strict';

define(['utils', 'spritesheet', 'spriteobject', 'camera'], function (Utils, SpriteSheet, SpriteObject, Camera) {
    'use strict';

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : Utils.nop;
        if (forEach) {
            this.forEach = forEach.bind(this);
        } else {
            switch (this.options.type) {
                case "grid":
                    break;
                default:
                    Utils.handleError('Collection type not recognized');
                    break;
            }
        }
    }
    Collection.prototype.pos = null;
    Collection.prototype.size = null;
    Collection.prototype.getSprite = Utils.nop;
    Collection.prototype.forEach = Grid_forEach;
    Collection.prototype.options = null;
    Collection.prototype.getSprite = Utils.nop;
    Collection.prototype.isCollection = true;
    Collection.prototype.get = Utils.nop;
    Collection.prototype.find = Utils.nop;
    Collection.prototype.create = Utils.nop;

    /**
     *  FUNCTION DEFINITIONS
     */
    function Grid_forEach(callback) {
        var optionsX = this.options.x;
        var optionsY = this.options.y;
        var optionsWidth = this.options.width;
        var optionsHeight = this.options.height;
        var gridCount = optionsWidth * optionsHeight;
        var count = this.options.count || 1;
        var length = gridCount * count;

        for (var i = 0; i < length; i++) {
            var _x = optionsX + i % optionsWidth;
            var _y = optionsY + Math.floor(i / optionsWidth) % optionsHeight;
            var c = Math.floor(i / gridCount);
            var obj = this.getSprite(_x, _y, c);
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

        return SpriteObject.create(x * cellSize, y * cellSize, size / 2, size, size, null, light, img);
    }

    var cubeFaces = [];
    function spriteCube(spriteInfo) {
        cubeFaces.length = 0;

        cube.faces.push(SpriteObject.create(x * cellSize, y * cellSize, size / 2, size, size, Camera.quaternions.southQuaternionArray, light, img));

        return cubeFaces;
    }

    function createSpriteCollection(options) {
        var spriteHash = [];spriteHash.length = 1000000;
        var areaSize = 50;
        var spriteRegistry = [];
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
            this.uid = ++spriteCount;
            spriteRegistry[this.uid] = this;
            this.index = index;
            this.enterArea(x, y);
        }
        SpriteInfo.prototype.leaveArea = function () {
            var areaId = getAreaHashId(this.x, this.y);
            var area = spriteHash[areaId];
            if (area) {
                if (area[this.uid]) delete area[this.uid];
            }
        };
        SpriteInfo.prototype.enterArea = function (x, y) {
            this.x = x;this.y = y;
            var areaId = getAreaHashId(this.x, this.y);
            var area = spriteHash[areaId] || (spriteHash[areaId] = {});
            area[this.uid] = this;
        };
        SpriteInfo.prototype.move = function (x, y) {
            this.leaveArea();
            this.enterArea(x, y);
        };

        function getAreaHashIdWithArea(x, y) {
            return Math.abs(x * 1331 ^ 312 + y * 131) % spriteHash.length;
        }

        function getAreaHashId(x, y) {
            x = Math.floor(x / areaSize);
            y = Math.floor(y / areaSize);
            return getAreaHashIdWithArea(x, y);
        }

        var selectedObj = { x: 0, y: 0 };
        function getCamPos() {
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
            var areaRange = 1;
            for (var _y2 = yArea - areaRange; _y2 <= yArea + areaRange; _y2++) {
                for (var _x2 = xArea - areaRange; _x2 <= xArea + areaRange; _x2++) {
                    var areaId = getAreaHashIdWithArea(_x2, _y2);
                    var area = spriteHash[areaId];
                    if (area) {
                        var props = Object.getOwnPropertyNames(area);
                        for (var i = 0; i < props.length; i++) {
                            var sprite = area[props[i]];
                            var obj = this.getSprite(sprite);
                            if (Array.isArray(obj)) {
                                obj.forEach(callback);
                            } else {
                                callback(obj);
                            }
                        }
                    }
                }
            }
        });
        spriteCollection.create = function (x, y, index) {
            return new SpriteInfo(x, y, index);
        };

        var array = [];
        spriteCollection.get = function (x, y) {
            var areaId = getAreaHashId(x, y);
            var area = spriteHash[areaId];
            array.length = 0;
            if (area) {
                var props = Object.getOwnPropertyNames(area);
                for (var i = 0; i < props.length; i++) {
                    var sprite = area[props[i]];
                    if (Math.floor(sprite.x) === x && Math.floor(sprite.y) === y) {
                        array.push(sprite);
                    }
                }
            }
            return array.length ? array : null;
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
//# sourceMappingURL=collection.js.map