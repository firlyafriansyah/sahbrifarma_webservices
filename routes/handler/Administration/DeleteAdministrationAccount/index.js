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
        throw new Error('This administration account target not found!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { lock: true, transaction: t });

      if (!loginStatus) {
        throw new Error('This administration account target does\'t have login status!');
      }

      const destroyLoginStatus = await loginStatus.destroy({ transaction: t, lock: true });

      if (!destroyLoginStatus) {
        throw new Error('Deleted login status for this administration account target failed!');
      }

      const destroyAdministrationAccount = await administrationAccount.destroy({
        transaction: t,
        lock: true,
      });

      if (!destroyAdministrationAccount) {
        throw new Error('Deleted this administration account target failed!');
      }

      await LogsCreator(User, uid, 'Delete Administration Account', 'error', 'This administration account target successfully deleted!');
      return res.json({
        status: 'success',
        message: 'This administration account target successfully deleted!',
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
