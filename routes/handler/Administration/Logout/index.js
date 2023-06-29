const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: uid },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('Akun tidak memiliki status login!');
      }

      if (!loginStatus.loggedIn) {
        throw new Error('Akun tidak sedang login di perangkat manapun!');
      }

      const updateLoginStatus = await loginStatus.update({
        loggedIn: false,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Update status login gagal!');
      }

      await LogsCreator(User, uid, 'Logout', 'success', 'Logout berhasil!');

      return res.json({
        status: 'success',
        message: 'Logout berhasil!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Logout', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
