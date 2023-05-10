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
        throw new Error('This administration account target not found!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uid },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account target doesn\'t have login status!');
      }

      if (!loginStatus.loggedIn) {
        throw new Error('This administration account target isn\'t logged in on any device!');
      }

      const updateLoginStatus = await loginStatus.update({
        loggedIn: false,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Faield updated login status for this administration account target!');
      }

      await LogsCreator(User, uid, 'Logout', 'success', 'This administration account successfully logout!');

      return res.json({
        status: 'success',
        message: 'This administration account successfully logout!',
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
