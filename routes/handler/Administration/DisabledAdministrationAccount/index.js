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
        throw new Error('This administration target not found!');
      }

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Can\'t disabled administration account with super admin role!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account target doesn\'t have login status!');
      }

      if (administrationAccount.status === 'inactive') {
        throw new Error('This administration account target already has an inactive status!');
      }

      const disabledAdministrationAccount = await administrationAccount.update({
        status: 'inactive',
      }, { transaction: t, lock: true });

      if (!disabledAdministrationAccount) {
        throw new Error('Disabled this administration account target failed!');
      }

      const updateLoginStatus = await loginStatus.update({
        loggedIn: false,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Updated login status for this administration account target failed!');
      }

      await LogsCreator(
        User,
        uid,
        'Disabled Administration Account',
        'success',
        'Successfully disabled this administration account target!',
      );

      return res.json({
        status: 'success',
        message: 'Successfully disabled this administration account target!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Disabled Administration Account', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
