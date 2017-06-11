define([
    'utils',
    'spritesheet',
    'spriteobject',
    'camera',
], function(Utils, SpriteSheet, SpriteObject, Camera) {

    'use strict';

    function nop() {
    }

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : nop;
        if(forEach) {
            this.forEach = forEach.bind(this);
        } else {
            switch(this.options.type) {
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
        const optionsX = this.options.x;
        const optionsY = this.options.y;
        const optionsWidth = this.options.width;
        const optionsHeight = this.options.height;
        const gridCount = optionsWidth*optionsHeight;
        const count = this.options.count || 1;
        const length = gridCount*count;

        for(let i=0; i<length; i++) {
            const x = optionsX + i%optionsWidth;
            const y = optionsY + Math.floor(i/optionsWidth) % optionsHeight;
            const c = Math.floor(i / gridCount);
            const obj = this.getSprite(x,y,c);
            if(obj) {
                if(obj.forEach) {
                    obj.forEach(callback);
                } else {
                    callback(obj);
                }
            }
        }
    }

    function destroyEverything() {
    }

    function spriteFace(spriteInfo) {
        const x = spriteInfo.x;
        const y = spriteInfo.y;
        const index = spriteInfo.index;
        const size = cellSize;
        const light = 1;
        const img = SpriteSheet.spritesheet.sprite[index];

        return SpriteObject.create(
            x*cellSize,y*cellSize,size/2,
            size,size,
            null,
            light,
            img
        );
    }

    const cubeFaces = [];
    function spriteCube(spriteInfo) {
        cubeFaces.length = 0;

        cube.faces.push(
            SpriteObject.create(
                x*cellSize,y*cellSize,size/2,
                size,size,
                Camera.quaternions.southQuaternionArray,
                light,
                img
            )
        );


        return cubeFaces;
    }

    function createSpriteCollection(options) {
        const spriteMap = [];
        const areaSize = 50;
        const spriteRegistry = [];
        const cellSize = 64;

        let spriteFunction = function(spriteInfo) {
            switch(spriteInfo.type) {
                case 'face':
                    return spriteFace(spriteInfo);
                    break;
                case 'cube':
                    return spriteCube(spriteInfo);
                    break;
            }
        };
        if(options.spriteFunction) {
            spriteFunction = options.spriteFunction;
        }

        let spriteCount = 0;
        function SpriteInfo(x,y,index) {
            this.uid = spriteCount++;
            spriteRegistry[this.uid] = this;
            this.index = index;
            this.enterArea(x,y);
        }
        SpriteInfo.prototype.leaveArea = function() {
            const areaId = getAreaId(this.x,this.y);
            const area = spriteMap[areaId];
            if(area) {
                const posId = Math.floor(this.x) + "_" + Math.floor(this.y);
                if(area[posId])
                    delete area[posId][this.uid];
            }
        };
        SpriteInfo.prototype.enterArea = function(x,y) {
            this.x = x; this.y = y;
            const areaId = getAreaId(this.x,this.y);
            const area = spriteMap[areaId] || (spriteMap[areaId] = {});
            const posId = Math.floor(this.x) + "_" + Math.floor(this.y);
            area[posId] = area[posId] || (area[posId] = {});
            area[posId][this.uid] = this;
        };
        SpriteInfo.prototype.move = function(x,y) {
            this.leaveArea();
            this.enterArea(x,y);
        };


        function getAreaId(x,y) {
            x = Math.floor(x/areaSize);
            y = Math.floor(y/areaSize);
            return x+"_"+y;
        }

        const selectedObj = { x: 0, y: 0};
        function getCamPos() {
            const camera = Camera.getCamera();
            const xPos = camera.position.x;
            const yPos = camera.position.y;

            selectedObj.x = Math.round(xPos/cellSize);
            selectedObj.y = Math.round(yPos/cellSize) + 6;
            return selectedObj;
        }

        const spriteCollection = new Collection(
            options,
            spriteFunction,
            function(callback) {
                const camPos = getCamPos();
                const xArea = Math.floor(camPos.x / areaSize);
                const yArea = Math.floor(camPos.y / areaSize);
                const range = 1;
                for(let y=yArea-range;y<=yArea+range;y++) {
                    for(let x=xArea-range;x<=xArea+range;x++) {
                        const area = spriteMap[x+"_"+y];
                        if(area) {
                            for(let a in area) {
                                const sprites = area[a];
                                for(let s in sprites) {
                                    const obj = this.getSprite(sprites[s]);
                                    if(Array.isArray(obj)) {
                                        obj.forEach(callback);
                                    } else {
                                        callback(obj);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        );
        spriteCollection.create = function(x,y,index) {
            return new SpriteInfo(x,y,index);
        };

        spriteCollection.get = function(x,y) {
            const areaId = getAreaId(x,y);
            const area = spriteMap[areaId];
            const posId = Math.floor(x) + "_" + Math.floor(y);
            return area?area[posId]:null;
        };
        spriteCollection.find = function(uid) {
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
