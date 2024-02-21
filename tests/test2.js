const resultOfSquareSumOfTwoNumbers = require('../tasks/task2').resultOfSquareSumOfTwoNumbers;
const assert = require('assert');
const { sumOfAllRanks } = require('../tasks/task3');

let data = [
    {args: [1, 6, 2], expected: 40},
    {args: [1, 2, 6], expected: 40},
    {args: [6, 2, 1], expected: 40},
];

describe('test2', function(){
    data.forEach(dataitem => {
        it(`It should return ${dataitem.expected} result for next args ${dataitem.args}`, function() {
            let result = resultOfSquareSumOfTwoNumbers(dataitem.args);
            assert.equal(result, dataitem.expected);
        });
    })

    // it('It should return 40', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(1, 6, 2);
    //     assert.equal(result, 40);
    // });
    // it('It should return 40', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(1, 2, 6);
    //     assert.equal(result, 40);
    // });
    // it('It should return 40', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(2, 6, 1);
    //     assert.equal(result, 40);
    // });
    // it('It should return 40', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(2, 1, 6);
    //     assert.equal(result, 40);
    // });
    // it('It should return 40', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(6, 1, 2);
    //     assert.equal(result, 40);
    // });
    // it('It should return 40', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(6, 2, 1);
    //     assert.equal(result, 40);
    // });

    // it('It should return 1', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(1, 0, -4);
    //     assert.equal(result, 1);
    // });
    // it('It should return 10', function() {
    //     let result = resultOfSquareSumOfTwoNumbers(-1, -5, 3);
    //     assert.equal(result, 10);
    // });
});