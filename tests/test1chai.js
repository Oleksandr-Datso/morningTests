const indexesOfSearchNumber = require('../tasks/task1').indexesOfSearchNumber;
const assert = require('chai').assert;

describe('Array', function () {
    it('It should return valid indexes of array for given number', function(){
        let arr = [6, -2, 3, 5, 7, 0, -1];
        let search = 5;
        let result = indexesOfSearchNumber(arr, search);
        assert.deepEqual(result, [0, 6]);
    });
    it('It should return valid indexes of array for given number', function(){
        let arr = [1, 1, 3, 2, 1, 1, 1];
        let search = 5;
        let result = indexesOfSearchNumber(arr, search);
        assert.deepEqual(result, [2, 3]);
    });
    it('It should NOT return valid indexes of array for given number', function(){
        let arr = [6, -2, 3, 5, 7, 0, -1];
        let search = 5;
        let result = indexesOfSearchNumber(arr, search);
        assert.notEqual(result, [0, 1]);
    });
});