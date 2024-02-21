module.exports = {
    sumOfAllRanks: function(num){
        let sum = 0;
        x = String(num);
        
        for(let i=0; i<x.length; i++) {
            sum += +x[i];
        }
        
        if(sum > 9) {
            x = String(sum);
            sum = 0;
            for(let i=0; i<x.length; i++) {
            sum += +x[i];
         }
        }
        return sum;
     }
}