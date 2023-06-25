const CryptoJS = require('crypto-js');

// Authorization
const text = CryptoJS.AES.encrypt('1', '_f1rly_').toString();

// Authentication
// const text = CryptoJS.AES.encrypt('5?dinda123', '_f1rly_').toString();

// eslint-disable-next-line no-console
console.log(text);
