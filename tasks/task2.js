module.exports = {
    resultOfSquareSumOfTwoNumbers: function(a, b, c) {
        let arr = [a, b, c];
        arr.sort(function(a, b) {
            return (a - b);
        }); // or arr.sort((a, b) => a - b);
        console.log(arr); // just to see compare results
        
        let result = ((arr.at(-1)**2) + (arr.at(-2)**2)); 
        console.log(result);
        return result;
    }
}