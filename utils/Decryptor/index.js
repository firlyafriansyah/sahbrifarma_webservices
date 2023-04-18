const CryptoJS = require('crypto-js');
require('dotenv').config();

const Decryptor = (text) => {
  if (text) {
    const passphrase = process.env.PASSPHRASE;
    const bytes = CryptoJS.AES.decrypt(text, passphrase);
    const textResult = bytes.toString(CryptoJS.enc.Utf8);

    const Head = textResult.split('?')[0]
    const Tail = textResult.split('?')[1]

    return {
      Head,
      Tail
    };
  }
  return 'Guest';
};

module.exports = Decryptor;