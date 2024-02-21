const sumOfAllRanks = require('../tasks/task3').sumOfAllRanks;
const assert = require('assert');
let data = [
    {num: 723, expected: 3}, 
    {num: 13579, expected: 7},
    {num: 0, expected: 0},
    {num: -12, expected: NaN},
    {num: '723', expected: 3},
    {num: 'hello', expected: NaN},
]
describe('Test 3', function() {
    data.forEach(dataitem => {
        it(`Should return rank ${dataitem.expected} for number ${dataitem.num}`, function(){
            let result = sumOfAllRanks(dataitem.num);
            assert.equal(result, dataitem.expected);
        });
    })
    /*
    it('Should return rank 3', function(){
        let result = sumOfAllRanks(723);
        assert.equal(result, 3);
    });
    it('Should return rank 7', function(){
        let result = sumOfAllRanks(13579);
        assert.equal(result, 7);
    });
    it('Should return rank 0', function(){
        let result = sumOfAllRanks(0);
        assert.equal(result, 0);
    });
    it('Should return NaN when value is below zero', function(){
        let result = sumOfAllRanks(-12);
        assert.equal(result, NaN);
    });
    it('Should return rank 3 for digit put in string', function(){
        let result = sumOfAllRanks('723');
        assert.equal(result, 3);
    });
    it('Should return NaN when value is below zero', function(){
        let result = sumOfAllRanks('hello');
        assert.equal(result, NaN);
    });
    */
});