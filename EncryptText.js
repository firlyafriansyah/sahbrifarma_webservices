const CryptoJS = require('crypto-js');

// Authorization
const text = CryptoJS.AES.encrypt('username', '_f1rly_').toString();

// Authentication
// const text = CryptoJS.AES.encrypt('username?password', '_f1rly_').toString();

console.log(text);
