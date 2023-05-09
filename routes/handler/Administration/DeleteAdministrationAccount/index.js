const { Sequelize } = require('sequelize');
const { AdministrationAccount, LoginStatus } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    await Sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: uid },
      }, { lock: true, transaction: t });

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { lock: true, transaction: t });

      await administrationAccount.destroy();
      await loginStatus.destroy();
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Delete Administration Account', 'error', 'This administration account not found!');
    return res.status(409).json({
      status: 'success',
      message: 'Deleted this administration account failed!',
    });
  }

  await LogsCreator(User, uid, 'Delete Administration Account', 'error', 'This administration account not found!');
  return res.json({
    status: 'success',
    message: 'Deleted this administration account success!',
  });

  // const administrationAccount = await AdministrationAccount.findOne({
  //   where: { uidAdministrationAccount: uid },
  // });

  // if (!administrationAccount) {
  //   await LogsCreator(User, uid, 'Delete Administration Account', 'error',
  // 'This administration account not found!');

  //   return res.status(404).json({
  //     status: 'error',
  //     message: 'This administration account not found!',
  //   });
  // }

  // if (administrationAccount.role === 'super-admin') {
  //   await LogsCreator(User, administrationAccount.uidAdministrationAccount,
  // 'Delete Administration Account', 'error',
  // 'Can\'t deleted administration account with super admin role!');

  //   return res.status(409).json({
  //     status: 'error',
  //     message: 'Can\'t deleted administration account with super admin role',
  //   });
  // }

  // const loginStatus = await LoginStatus.findOne({
  //   where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
  // });

  // if (!loginStatus) {
  //   await LogsCreator(User, administrationAccount.uidAdministrationAccount,
  // 'Delete Administration Account', 'error',
  // 'This administration account doesn\'t have login status!');

  //   return res.status(409).json({
  //     status: 'error',
  //     message: 'This administration account doesn\'t have login status!',
  //   });
  // }

  // try {
  //   await Sequelize.transaction(async (t) => {
  //     const administrationAccount = await
  //   })
  // }

  // const deletedLoginStatus = await loginStatus.destroy();

  // if (!deletedLoginStatus) {
  //   await LogsCreator(User, administrationAccount.uidAdministrationAccount,
  // 'Delete Administration Account', 'error', 'Deleted this administration account failed!');

  //   return res.status(409).json({
  //     status: 'error',
  //     message: 'Deleted this administration account failed!',
  //   });
  // }

  // const deletedAdministrationAccount = await administrationAccount.destroy();

  // if (!deletedAdministrationAccount) {
  //   await LogsCreator(User, administrationAccount.uidAdministrationAccount,
  // 'Delete Administration Account', 'error', 'Deleted this administration account failed!');
  //   await Logs.create({
  //     administrationAccount: User || 'Guest',
  //     action: 'Delete Administration Account',
  //     status: 'error',
  //     message: `Deleted administration account failed! (target: ${uid})`,
  //   });

  //   return res.status(409).json({
  //     status: 'error',
  //     message: 'Deleted administration account failed!',
  //   });
  // }

  // await Logs.create({
  //   administrationAccount: User || 'Guest',
  //   action: 'Delete Administration Account',
  //   status: 'success',
  //   message: `Administration account succesfully deleted! (target: ${uid})`,
  // });

  // return res.json({
  //   status: 'success',
  //   message: 'Administration account succesfully deleted!',
  // });
};
