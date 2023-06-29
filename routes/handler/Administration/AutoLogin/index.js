const bcrypt = require('bcrypt');
const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authentication } = req.headers;
  const { Uid, Pass } = Decryptor(authentication, 'authentication');

  if (!authentication) {
    await LogsCreator(null, null, 'Auto Login', 'error', 'Autentikasi tidak ditemukan!');

    return res.status(401).json({
      status: 'error',
      message: 'Autentikasi tidak ditemukan!',
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: Uid },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const isValidPassword = await bcrypt.compare(
        Pass,
        administrationAccount.password,
      );

      if (!isValidPassword) {
        throw new Error('Password salah!');
      }

      if (administrationAccount.status === 'inactive') {
        throw new Error('Akun tidak aktif!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('Akun tidak memiliki status login!');
      }

      if (!loginStatus.loggedIn) {
        throw new Error('Akun sedang login di perangkat lain!');
      }

      if (administrationAccount.updatedAt.toString() !== loginStatus.lastUpdate.toString()) {
        throw new Error('Akun baru saja di perbaharui, silahkan login ulang!');
      }

      const updatedLoginStatus = await loginStatus.update({
        loggedIn: true,
      }, { transaction: t, lock: true });

      if (!updatedLoginStatus) {
        throw new Error('Update login status gagal!');
      }

      await LogsCreator(null, Uid, 'Auto Login', 'success', 'Akun berhasil login dengan auto login!');

      return res.json({
        status: 'success',
        message: 'Akun berhasil login dengan auto login!',
      });
    });
  } catch (error) {
    await LogsCreator(null, Uid, 'Auto Login', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
