const axios = require("axios");
const credentials = require("./credentials");
const AccountApi = require("../api/AccountApi");
const showLog = require('./logger').loggerToExport;


module.exports = class  DataClass {
    static async generateIsbnIndex(count) {
        const isbnToUse = parseInt(Math.random() * (count-1));  //parseInt equal to Number or MAth.round()
        // showLog.info(isbnToUse);
        return isbnToUse;
    }
};

//module.exports.dataClass = new DataClass();  as option to try to use