module.exports = class BaseApi {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.headers = {
       accept: "application/json",
       "Content-Type": "application/json",
    };
  }
};
