module.exports = {
    indexesOfSearchNumber: function(arr, search) {
        let array = [];
        for(let i=0; i<arr.length-1; i++) {
            let temp = search - arr[i];

            for (let j=i+1; j<arr.length; j++) {
                if(arr[j] == temp) {
                    console.log("Match of i: " + arr[i] + " + j: " + arr[j] + " will give result = " + search);
                    console.log("First index: " + i + " + second index: " + j);
                    console.log("-----------");
                    array.push([i, j]);
                }
            }
        }
        return array;
    }
}