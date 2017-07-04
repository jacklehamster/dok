define([
    'utils',
    'spritesheet',
    'spriteobject',
    'camera',
], function(Utils, SpriteSheet, SpriteObject, Camera) {
    'use strict';

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : Utils.nop;
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
        const spriteHash = []; spriteHash.length = 1000000;
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
            this.uid = ++spriteCount;
            spriteRegistry[this.uid] = this;
            this.index = index;
            this.enterArea(x,y);
        }
        SpriteInfo.prototype.leaveArea = function() {
            const areaId = getAreaHashId(this.x,this.y);
            const area = spriteHash[areaId];
            if(area) {
                if(area[this.uid])
                    delete area[this.uid];
            }
        };
        SpriteInfo.prototype.enterArea = function(x,y) {
            this.x = x; this.y = y;
            const areaId = getAreaHashId(this.x,this.y);
            const area = spriteHash[areaId] || (spriteHash[areaId] = {});
            area[this.uid] = this;
        };
        SpriteInfo.prototype.move = function(x,y) {
            this.leaveArea();
            this.enterArea(x,y);
        };

        function getAreaHashIdWithArea(x,y) {
            return Math.abs(x*1331 ^ 312 + y*131) % spriteHash.length;
        }

        function getAreaHashId(x,y) {
            x = Math.floor(x/areaSize);
            y = Math.floor(y/areaSize);
            return getAreaHashIdWithArea(x,y);
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
                const areaRange = 1;
                for(let y=yArea-areaRange;y<=yArea+areaRange;y++) {
                    for(let x=xArea-areaRange;x<=xArea+areaRange;x++) {
                        const areaId = getAreaHashIdWithArea(x,y);
                        const area = spriteHash[areaId];
                        if(area) {
                            const props = Object.getOwnPropertyNames(area);
                            for(let i=0;i<props.length;i++) {
                                const sprite = area[props[i]];
                                const obj = this.getSprite(sprite);
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
        );
        spriteCollection.create = function(x,y,index) {
            return new SpriteInfo(x,y,index);
        };
        
        const array = [];
        spriteCollection.get = function(x,y) {
            const areaId = getAreaHashId(x,y);
            const area = spriteHash[areaId];
            array.length = 0;
            if(area) {
                const props = Object.getOwnPropertyNames(area);
                for(let i=0;i<props.length;i++) {
                    const sprite = area[props[i]];
                    if(Math.floor(sprite.x)===x && Math.floor(sprite.y)===y) {
                        array.push(sprite);
                    }
                }
            }
            return array.length ? array : null;
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
