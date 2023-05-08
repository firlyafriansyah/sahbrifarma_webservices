const CryptoJS = require('crypto-js');
require('dotenv').config();

const Decryptor = (text, type = 'authorization') => {
  if (text) {
    const passphrase = process.env.PASSPHRASE;
    const bytes = CryptoJS.AES.decrypt(text, passphrase);
    const User = parseInt(bytes.toString(CryptoJS.enc.Utf8), 10);

    if (type === 'authentication') {
      const Head = parseInt(User.split('?')[0], 10);
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
