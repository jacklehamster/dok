'use strict';

define(['threejs', 'objectpool'], function (THREE, ObjectPool) {
    'use strict';

    function SpriteObject() {
        this.position = new THREE.Vector3();
        this.size = new Float32Array(3).fill(0);
        this.size[2] = 1;
        this.quaternionArray = new Float32Array(4).fill(0);
    }

    function initSpriteObject(spriteObject, x, y, z, width, height, quaternionArray, light, img) {
        spriteObject.position.set(x, y, z);
        spriteObject.size[0] = width;
        spriteObject.size[1] = height;
        spriteObject.hasQuaternionArray = quaternionArray !== null;
        if (spriteObject.hasQuaternionArray) {
            spriteObject.quaternionArray[0] = quaternionArray[0];
            spriteObject.quaternionArray[1] = quaternionArray[1];
            spriteObject.quaternionArray[2] = quaternionArray[2];
            spriteObject.quaternionArray[3] = quaternionArray[3];
        }
        spriteObject.light = light;
        spriteObject.img = img;
    }

    SpriteObject.prototype.position = null;
    SpriteObject.prototype.size = null;
    SpriteObject.prototype.hasQuaternionArray = false;
    SpriteObject.prototype.quaternionArray = null;
    SpriteObject.prototype.light = 1;
    SpriteObject.prototype.img = -1;
    SpriteObject.prototype.offset = null;

    var objectPool = new ObjectPool(SpriteObject);

    SpriteObject.create = function (x, y, z, width, height, quaternionArray, light, img) {
        var spriteObject = objectPool.create();
        initSpriteObject(spriteObject, x, y, z, width, height, quaternionArray, light, img);
        return spriteObject;
    };

    SpriteObject.clear = function () {
        objectPool.recycleAll();
    };

    return SpriteObject;
});
//# sourceMappingURL=spriteobject.js.map