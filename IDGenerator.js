define(function() {
    function IDGenerator() {
        const array = [];
        let max = 1;
        this.recycle = function(id) {
            array.push(id);
        };
        this.get = function() {
            if(array.length) {
                return array.pop();
            }
            return max++;
        };
    }
    IDGenerator.prototype.recycle = null;
    IDGenerator.prototype.get = null;
    return IDGenerator;
});
