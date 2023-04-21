const CryptoJS = require('crypto-js');

const text = CryptoJS.AES.encrypt('super-admin?super-admin', '_f1rly_').toString();

console.log(text);
