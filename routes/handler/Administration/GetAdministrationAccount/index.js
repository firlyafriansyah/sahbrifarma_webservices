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
        attributes: ['uidAdministrationAccount', 'username', 'role', 'status', ['updated_at', 'updatedAt']],
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('This administration account target not found!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
        attributes: [['logged_in', 'loggedIn']],
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account target doesn\'t have login status!');
      }

      await LogsCreator(User, uid, 'Get Administration Account', 'success', 'Successfully get this adminstration account target detail!');

      return res.json({
        status: 'success',
        data: {
          uidAdministrationAccount: administrationAccount.uidAdministrationAccount,
          username: administrationAccount.username,
          role: administrationAccount.role,
          status: administrationAccount.status,
          updatedAt: administrationAccount.updatedAt,
          loggedIn: loginStatus.loggedIn,
        },
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
