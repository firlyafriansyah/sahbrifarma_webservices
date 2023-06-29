const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid, status } = req.params;

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

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Akun dengan role Super Admin tidak dapat diperbaharui!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('Akun tidak memiliki status login!');
      }

      if (status === 'activated') {
        if (administrationAccount.status === 'active') {
          throw new Error('Akun sudah aktif!');
        }
      } else if (administrationAccount.status === 'inactive') {
        throw new Error('Akun tidak aktif!');
      }

      const updateAdministrationAccountStatus = await administrationAccount.update({
        status: status === 'activated' ? 'active' : 'inactive',
      }, { transaction: t, lock: true });

      if (!updateAdministrationAccountStatus) {
        throw new Error('Update status akun gagal!');
      }

      if (status === 'disabled') {
        const updateLoginStatus = await loginStatus.update({
          loggedIn: false,
        }, { transaction: t, lock: true });

        if (!updateLoginStatus) {
          throw new Error('Updated status login gagal');
        }
      }

      await LogsCreator(User, uid, 'Update Status Administration Account', 'success', 'Update status akun berhasil!');

      return res.json({
        status: 'success',
        message: 'Update status akun berhasil!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Status Administration Account', 'error', error.message);
    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
