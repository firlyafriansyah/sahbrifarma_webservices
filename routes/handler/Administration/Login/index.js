const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const CryptoJS = require('crypto-js');
const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');
const { LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    username: 'string|empty:false',
    password: 'string|empty:false',
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(409).json({
      status: 'error',
      message: validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { username: req.body.username },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('Akun ini tidak ditemukan!');
      }

      const isValidPassword = await bcrypt.compare(
        req.body.password,
        administrationAccount.password,
      );

      if (!isValidPassword) {
        throw new Error('Username atau password salah!');
      }

      if (administrationAccount.status === 'inactive') {
        throw new Error('Akun tidak aktif!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('Akun tidak memiliki login status!');
      }

      if (loginStatus.loggedIn) {
        throw new Error('Akun sedang login di perangkat lain!');
      }

      const updateLoginStatus = await loginStatus.update({
        lastUpdate: administrationAccount.updatedAt,
        loggedIn: true,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Gagal update login status!');
      }

      const authentication = CryptoJS.AES.encrypt(`${administrationAccount.uidAdministrationAccount}?${req.body.password}`, process.env.PASSPHRASE).toString();
      const authorization = CryptoJS.AES.encrypt(`${administrationAccount.uidAdministrationAccount}`, process.env.PASSPHRASE).toString();

      await LogsCreator(null, administrationAccount.uidAdministrationAccount, 'Administration Account Login', 'success', 'Berhasil login!');

      return res.json({
        status: 'success',
        data: {
          username: administrationAccount.username,
          role: administrationAccount.role,
          token: `${authentication}~${authorization}`,
        },
      });
    });
  } catch (error) {
    await LogsCreator(null, null, 'Administration Account Login', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
