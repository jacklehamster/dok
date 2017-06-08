'use strict';

define(['utils'], function (Utils) {

    /**
     *  CLASS DEFINITIONS
     */
    function ObjectPool(classObject) {
        this.pool = [];
        this.classObject = classObject;
    }
    ObjectPool.prototype.classObject = null;
    ObjectPool.prototype.pool = null;
    ObjectPool.prototype.index = 0;
    ObjectPool.prototype.create = create;
    ObjectPool.prototype.recycleAll = recycleAll;

    /**
     *  FUNCTION DEFINITIONS
     */
    function create() {
        if (this.index >= this.pool.length) {
            this.pool.push(new this.classObject());
        }
        return this.pool[this.index++];
    }

    function recycleAll() {
        this.index = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    return ObjectPool;
});
//# sourceMappingURL=objectpool.js.map