const CryptoJS = require('crypto-js');

const text = CryptoJS.AES.encrypt('firly', '_f1rly_').toString();

console.log(text);
