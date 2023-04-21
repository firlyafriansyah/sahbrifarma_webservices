const CryptoJS = require('crypto-js');
require('dotenv').config();

const Decryptor = (text, type = 'authorization') => {
  if (text) {
    const passphrase = process.env.PASSPHRASE;
    const bytes = CryptoJS.AES.decrypt(text, passphrase);
    const User = bytes.toString(CryptoJS.enc.Utf8);

    if (type === 'authentication') {
      const Head = User.split('?')[0];
      const Tail = User.split('?')[1];

      return {
        Head,
        Tail,
      };
    }

    return {
      User,
    };
  }
  return 'Guest';
};

module.exports = Decryptor;
