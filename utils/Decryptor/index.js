const CryptoJS = require('crypto-js');
require('dotenv').config();

const Decryptor = (text) => {
  if (text) {
    const passphrase = process.env.PASSPHRASE;
    const bytes = CryptoJS.AES.decrypt(text, passphrase);
    const textResult = bytes.toString(CryptoJS.enc.Utf8);

    return textResult;
  }
  return 'Guest';
};

module.exports = Decryptor;
