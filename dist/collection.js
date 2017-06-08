'use strict';

define(['utils', 'spritesheet', 'spriteobject', 'camera'], function (Utils, SpriteSheet, SpriteObject, Camera) {

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
    Collection.prototype.forEach = Grid_forEach;
    Collection.prototype.options = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.isCollection = true;

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
            for (var _y2 = yArea - range; _y2 <= yArea + range; _y2++) {
                for (var _x2 = xArea - range; _x2 <= xArea + range; _x2++) {
                    var area = spriteMap[_x2 + "_" + _y2];
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
//# sourceMappingURL=collection.js.map