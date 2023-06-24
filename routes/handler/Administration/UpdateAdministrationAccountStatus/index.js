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
        throw new Error('Administration Account not found!');
      }

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Can\'t update status administration account with super admin role!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account doesn\'t have login status!');
      }

      if (status === 'activated') {
        if (administrationAccount.status === 'active') {
          throw new Error('This administration account already has an active status!');
        }
      } else if (administrationAccount.status === 'inactive') {
        throw new Error('This administration account already has an inactive status!');
      }

      const updateAdministrationAccountStatus = await administrationAccount.update({
        status: status === 'activated' ? 'active' : 'inactive',
      }, { transaction: t, lock: true });

      if (!updateAdministrationAccountStatus) {
        throw new Error('Update status this administration account failed!');
      }

      if (status === 'disabled') {
        const updateLoginStatus = await loginStatus.update({
          loggedIn: false,
        }, { transaction: t, lock: true });

        if (!updateLoginStatus) {
          throw new Error('Updated login status for this administration account failed!');
        }
      }

      await LogsCreator(User, uid, 'Update Status Administration Account', 'success', 'Successfully updated this administration account status!');

      return res.json({
        status: 'success',
        message: 'Successfully updated this administration account status!',
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
