define([
    'threejs',
    'objectpool',
], function(THREE, ObjectPool) {
    'use strict';

    function SpriteObject() {
        this.position = new THREE.Vector3();
        this.size = new Float32Array([0,0,1]);
        this.quaternionArray = new Float32Array(4).fill(0);
    }

    SpriteObject.prototype.init = function(
            x,y,z,
            width, height,
            quaternionArray, light, img) {
        this.position.set(x,y,z);
        this.size[0] = width;
        this.size[1] = height;
        this.hasQuaternionArray = quaternionArray !== null;
        if(this.hasQuaternionArray) {
            this.quaternionArray[0] = quaternionArray[0];
            this.quaternionArray[1] = quaternionArray[1];
            this.quaternionArray[2] = quaternionArray[2];
            this.quaternionArray[3] = quaternionArray[3];
        }
        this.light = light;
        this.img = img;
        return this;
    };
    SpriteObject.prototype.position = null;
    SpriteObject.prototype.size = null;
    SpriteObject.prototype.hasQuaternionArray = false;
    SpriteObject.prototype.quaternionArray = null;
    SpriteObject.prototype.light = 1;
    SpriteObject.prototype.img = -1;
    SpriteObject.prototype.offset = null;

    SpriteObject.create = function(
        x,y,z,width,height,quaternionArray,light, img
    ) {
        return ObjectPool.create(SpriteObject).init(x,y,z,width,height,quaternionArray,light, img);
    }

    return SpriteObject;
});
