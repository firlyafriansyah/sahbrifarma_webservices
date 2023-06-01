const CryptoJS = require('crypto-js');

// Authorization
// const text = CryptoJS.AES.encrypt('5', '_f1rly_').toString();

// Authentication
const text = CryptoJS.AES.encrypt('5?dinda123', '_f1rly_').toString();

console.log(text);
