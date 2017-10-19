define(function() {

    const SIZE = 1000000;
    const buckets = new Uint32Array(SIZE+1);
    const counts = new Uint32Array(SIZE+1);
    let indexFunction = identity;

    /**
     *  FUNCTION DEFINITIONS
     */
    function getMinMax(array, offset, length) {
        let firstIndex = indexFunction(array[offset]);
        let minNum = firstIndex;
        let maxNum = firstIndex;
        let previousNum = firstIndex;
        let inOrder = true;
        for(let i=1; i<length; i++) {
            const index = indexFunction(array[offset+i]);
            if(previousNum > index) {
                inOrder = false;
                if(index < minNum) {
                    minNum = index;
                }
            } else {
                if(index > maxNum) {
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
    const min_max_result = {
        min: 0,
        max: 0,
        inOrder: false,
    };

    function identity(a) {
        return a;
    }

    function turboSort(array, size, func) {
        if(array) {
            size = size ? Math.min(size,array.length) : array.length;
            if(size > 1) {
                indexFunction = func ? func : identity;
                turboSortHelper(array, 0, size ? size : array.length);
            }
        }
    }

    function turboSortHelper(array, offset, length) {
        const arrayInfo = getMinMax(array, offset, length);
        if(arrayInfo.inOrder) {
            return;
        }
        const min = arrayInfo.min;
        const max = arrayInfo.max;
        const range = max-min;
        if(range===0) {
            return;
        }
        
        const bucketSize = Math.min(length, SIZE);

        let i, index;
        for(i=0; i<bucketSize; i++) {
            counts[i] = 0;
        }
        counts[bucketSize] = 1;
        for(i=0; i<length; i++) {
            index = Math.floor((bucketSize-1) * (indexFunction(array[i+offset]) - min)/range);
            counts[index]++;
        }

        for(i=0; i<bucketSize; i++) {
            buckets[i] = 0;
        }
        buckets[bucketSize] = offset + length;
        buckets[0] = offset;
        for(i=1; i<bucketSize; i++) {
            buckets[i] = buckets[i-1] + counts[i-1];
        }

        let voyager = offset, bucketId = 0;
        while(bucketId<bucketSize) {
            index = Math.floor((bucketSize-1) * (indexFunction(array[voyager]) - min)/range);
            const newSpot = buckets[index] + --counts[index];
            swap(array,voyager,newSpot);
            while(!counts[bucketId]) {
                bucketId++;
            }
            voyager = buckets[bucketId];
        }
        for(i=0; i<bucketSize; i++) {
            counts[i] = buckets[i + 1] - buckets[i];
        }
        for(i=0; i<bucketSize; i++) {
            if(counts[i] > 1) {
                turboSortHelper(array, buckets[i], counts[i]);
            }
        }
    }

    function swap(array, a, b) {
        const temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }
    return turboSort;
});
