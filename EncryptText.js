const CryptoJS = require('crypto-js');

const text = CryptoJS.AES.encrypt('firly?$2b$10$48w6gBv1KFPB/DIW.YK9F.Fl6biBd.7y2yDxgJSd62ykYk2zZ3L4u', '_f1rly_').toString();

console.log(text);
