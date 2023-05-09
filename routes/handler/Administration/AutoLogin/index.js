const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authentication } = req.headers;
  const { Uid, Pass } = Decryptor(authentication, 'authentication');

  if (!authentication) {
    await LogsCreator(null, null, 'Auto Login', 'error', 'Authentication not found!');

    return res.status(401).json({
      status: 'error',
      message: 'Authentication not found!',
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: Uid },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('This administration account not found!');
      }

      if (Pass !== administrationAccount.password) {
        throw new Error('Password not match with this administration account!');
      }

      if (administrationAccount.status === 'inactive') {
        throw new Error('This administration account status is inactive!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account doesn\'t have login status!');
      }

      if (!loginStatus.loggedIn) {
        throw new Error('This administration account isn\'t currently logged in on any device!');
      }

      if (administrationAccount.updatedAt.toString() !== loginStatus.lastUpdate.toString()) {
        throw new Error('This administration account recently updated, please re-login!');
      }

      const updatedLoginStatus = await loginStatus.update({
        loggedIn: true,
      }, { transaction: t, lock: true });

      if (!updatedLoginStatus) {
        throw new Error('Updated login status for this administration account failed!');
      }

      await LogsCreator(null, Uid, 'Auto Login', 'success', 'This administration account successfully login with auto login!');

      return res.json({
        status: 'success',
        data: {
          username: administrationAccount.username,
          role: administrationAccount.role,
        },
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
