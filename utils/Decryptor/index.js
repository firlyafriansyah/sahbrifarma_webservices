const CryptoJS = require('crypto-js');
require('dotenv').config();

function Decryptor(text, type = 'authorization') {
  if (text) {
    const passphrase = process.env.PASSPHRASE;
    const bytes = CryptoJS.AES.decrypt(text, passphrase);
    const User = parseInt(bytes.toString(CryptoJS.enc.Utf8), 10);
    const authentication = bytes.toString(CryptoJS.enc.Utf8);

    if (Number.isNaN(User)) {
      return {
        User: null,
      };
    }

    if (type === 'authentication') {
      const Uid = authentication.split('?')[0];
      const Pass = authentication.split('?')[1];

      return {
        Uid,
        Pass,
      };
    }

    return {
      User,
    };
  }
  return {
    User: null,
  };
}

module.exports = Decryptor;
