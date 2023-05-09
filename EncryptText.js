const CryptoJS = require('crypto-js');

// Authorization
const text = CryptoJS.AES.encrypt('1', '_f1rly_').toString();

// Authentication
// const text = CryptoJS.AES.encrypt('uid?password', '_f1rly_').toString();

console.log(text);
