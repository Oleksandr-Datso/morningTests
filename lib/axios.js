const { default: axios } = require('axios');

const myAxios = axios.create();
myAxios.defaults.headers.post['Accept'] = 'application/json';
myAxios.defaults.headers.post['Content-Type'] = 'application/json';
myAxios.defaults.config = {validateStatus: (status) => status <= 500};
 
exports.default = myAxios;