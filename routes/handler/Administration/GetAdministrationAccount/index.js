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
        attributes: { exclude: ['password'] },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
        attributes: [['logged_in', 'loggedIn']],
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('Akun tidak memiliki status login!');
      }

      await LogsCreator(User, uid, 'Get Administration Account', 'success', 'Detail akun berhasil didapatkan!');

      return res.json({
        status: 'success',
        administrationAccount,
        loginStatus,
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Get Administration Account', 'success', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
