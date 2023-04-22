const CryptoJS = require('crypto-js');

const text = CryptoJS.AES.encrypt('username?id?role/password', '_f1rly_').toString();

console.log(text);
