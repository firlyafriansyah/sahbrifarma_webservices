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
      }, { lock: true, transaction: t });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Akun dengan role Super Admin tidak dapat dihapus!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { lock: true, transaction: t });

      if (!loginStatus) {
        throw new Error('Akun tidak memiliki status login!');
      }

      const destroyLoginStatus = await loginStatus.destroy({ transaction: t, lock: true });

      if (!destroyLoginStatus) {
        throw new Error('Hapus akun gagal!');
      }

      const destroyAdministrationAccount = await administrationAccount.destroy({
        transaction: t,
        lock: true,
      });

      if (!destroyAdministrationAccount) {
        throw new Error('Hapus akun gagal!');
      }

      await LogsCreator(User, uid, 'Delete Administration Account', 'error', 'Hapus akun berhasil!');
      return res.json({
        status: 'success',
        message: 'Hapus akun berhasil!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Delete Administration Account', 'error', error.message);
    return res.status(409).json({
      status: 'success',
      message: error.message,
    });
  }
};
