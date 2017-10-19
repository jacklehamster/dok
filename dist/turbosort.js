"use strict";

define(function () {

    var SIZE = 1000000;
    var buckets = new Uint32Array(SIZE + 1);
    var counts = new Uint32Array(SIZE + 1);
    var indexFunction = identity;

    /**
     *  FUNCTION DEFINITIONS
     */
    function getMinMax(array, offset, length) {
        var firstIndex = indexFunction(array[offset]);
        var minNum = firstIndex;
        var maxNum = firstIndex;
        var previousNum = firstIndex;
        var inOrder = true;
        for (var i = 1; i < length; i++) {
            var index = indexFunction(array[offset + i]);
            if (previousNum > index) {
                inOrder = false;
                if (index < minNum) {
                    minNum = index;
                }
            } else {
                if (index > maxNum) {
                    maxNum = index;
                }
            }
            previousNum = index;
        }
        min_max_result.min = minNum;
        min_max_result.max = maxNum;
        min_max_result.inOrder = inOrder;
        return min_max_result;
    }
    var min_max_result = {
        min: 0,
        max: 0,
        inOrder: false
    };

    function identity(a) {
        return a;
    }

    function turboSort(array, size, func) {
        if (array) {
            size = size ? Math.min(size, array.length) : array.length;
            if (size > 1) {
                indexFunction = func ? func : identity;
                turboSortHelper(array, 0, size ? size : array.length);
            }
        }
    }

    function turboSortHelper(array, offset, length) {
        var arrayInfo = getMinMax(array, offset, length);
        if (arrayInfo.inOrder) {
            return;
        }
        var min = arrayInfo.min;
        var max = arrayInfo.max;
        var range = max - min;
        if (range === 0) {
            return;
        }

        var bucketSize = Math.min(length, SIZE);

        var i = void 0,
            index = void 0;
        for (i = 0; i < bucketSize; i++) {
            counts[i] = 0;
        }
        counts[bucketSize] = 1;
        for (i = 0; i < length; i++) {
            index = Math.floor((bucketSize - 1) * (indexFunction(array[i + offset]) - min) / range);
            counts[index]++;
        }

        for (i = 0; i < bucketSize; i++) {
            buckets[i] = 0;
        }
        buckets[bucketSize] = offset + length;
        buckets[0] = offset;
        for (i = 1; i < bucketSize; i++) {
            buckets[i] = buckets[i - 1] + counts[i - 1];
        }

        var voyager = offset,
            bucketId = 0;
        while (bucketId < bucketSize) {
            index = Math.floor((bucketSize - 1) * (indexFunction(array[voyager]) - min) / range);
            var newSpot = buckets[index] + --counts[index];
            swap(array, voyager, newSpot);
            while (!counts[bucketId]) {
                bucketId++;
            }
            voyager = buckets[bucketId];
        }
        for (i = 0; i < bucketSize; i++) {
            counts[i] = buckets[i + 1] - buckets[i];
        }
        for (i = 0; i < bucketSize; i++) {
            if (counts[i] > 1) {
                turboSortHelper(array, buckets[i], counts[i]);
            }
        }
    }

    function swap(array, a, b) {
        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }
    return turboSort;
});
//# sourceMappingURL=turbosort.js.map