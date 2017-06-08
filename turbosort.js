define(function() {

    var buckets;
    var counts;
    var SIZE = 1000;
    var indexFunction;

    /**
     *  FUNCTION DEFINITIONS
     */
    function initArray(size) {
        if(!buckets) {
            buckets = new Uint32Array(size+1);
            counts = new Uint32Array(size+1);
        }
    }

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

    function quickSort(array, size) {
        quickSortHelper(array, 0, size ? size-1 : array.length-1, compareIndex);
    }

    function compareIndex(a,b) {
        return indexFunction(a)-indexFunction(b);
    }

    function turboSortHelper(array, offset, length) {
        if(length < 200) {
            quickSortHelper(array, offset, offset+length-1, compareIndex);
            return;
        }
        var arrayInfo = getMinMax(array, offset, length);
        if(arrayInfo.inOrder) {
            return;
        }
        var min = arrayInfo.min;
        var max = arrayInfo.max;
        var range = max-min;
        if(range===0) {
            return;
        }

        var i, index;
        counts.fill(0);
        counts[SIZE] = 1;
        for(i=0; i<length; i++) {
            index = Math.floor((SIZE-1) * (indexFunction(array[i+offset]) - min)/range);
            counts[index]++;
        }

        buckets.fill(0);
        buckets[SIZE] = length;
        buckets[0] = offset;
        for(i=1; i<SIZE; i++) {
            buckets[i] = buckets[i-1] + counts[i-1];
        }

        var voyager = offset, bucketId = 0;
        while(bucketId<SIZE) {
            index = Math.floor((SIZE-1) * (indexFunction(array[voyager]) - min)/range);
            var newSpot = buckets[index] + --counts[index];
            swap(array,voyager,newSpot);
            while(!counts[bucketId]) {
                bucketId++;
            }
            voyager = buckets[bucketId];
        }
        for(i=0; i<SIZE; i++) {
            counts[i] = buckets[i + 1] - buckets[i];
        }
        for(i=0; i<SIZE; i++) {
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

    function quickSortHelper(arr, left, right, compare){
        const len = arr.length;

        if(left < right){
            const partitionIndex = partition(arr, right, left, right, compare);

            //sort left and right
            quickSortHelper(arr, left, partitionIndex - 1, compare);
            quickSortHelper(arr, partitionIndex + 1, right, compare);
        }
        return arr;
    }

    function partition(arr, pivot, left, right, compare){
        const pivotValue = arr[pivot];
        let partitionIndex = left;

        for(let i = left; i < right; i++){
            if(compare(arr[i] , pivotValue)<0){
                swap(arr, i, partitionIndex);
                partitionIndex++;
            }
        }
        swap(arr, right, partitionIndex);
        return partitionIndex;
    }

    /**
     *   PROCESSES
     */
    initArray(SIZE);

    return turboSort;
});
