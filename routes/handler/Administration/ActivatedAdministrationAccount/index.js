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
        throw new Error('Administration Account not found!');
      }

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Can\'t activated administration account with super admin role!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account doesn\'t have login status!');
      }

      if (administrationAccount.status === 'active') {
        throw new Error('This administration account already has an active status!');
      }

      const activedAdministrationAccount = await administrationAccount.update({
        status: 'active',
      }, { transaction: t, lock: true });

      if (!activedAdministrationAccount) {
        throw new Error('Activated this administration account failed!');
      }

      const updateLoginStatus = await loginStatus.update({
        loggedIn: false,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Updated login status for this administration account failed!');
      }

      await LogsCreator(User, uid, 'Activated Administration Account', 'success', 'Successfully activated this administration account!');

      return res.json({
        status: 'success',
        message: 'Successfully activated this administration account!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Activated Administration Account', 'error', error.message);
    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
