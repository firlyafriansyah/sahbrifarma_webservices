const CryptoJS = require('crypto-js');
require('dotenv').config();

function Decryptor(text, type = 'authorization') {
  if (text) {
    const passphrase = process.env.PASSPHRASE;
    const bytes = CryptoJS.AES.decrypt(text, passphrase);
    const User = parseInt(bytes.toString(CryptoJS.enc.Utf8), 10);

    if (Number.isNaN(User)) {
      return {
        User: null,
      };
    }

    if (type === 'authentication') {
      const Uid = parseInt(User.split('?')[0], 10);
      const Pass = User.split('?')[1];

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
