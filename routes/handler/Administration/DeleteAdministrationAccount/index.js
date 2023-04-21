const { AdministrationAccount, Logs, LoginStatus } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Administration Account',
      status: 'error',
      message: `Administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  if (administrationAccount.role === 'super-admin') {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Administration Account',
      status: 'error',
      message: `This account is super admin account, you can't deleted super admin! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account is super admin account, you can\'t deleted super admin!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  if (!loginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Administration Account',
      status: 'error',
      message: `Login status for this administration account not found! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Login status for this administration account not found!',
    });
  }

  const deletedLoginStatus = await loginStatus.destroy();

  if (!deletedLoginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Login Status',
      status: 'error',
      message: `Deleted login status for this administration account failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Deleted login status for this administration account failed!',
    });
  }

  const deletedAdministrationAccount = await administrationAccount.destroy();

  if (!deletedAdministrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Administration Account',
      status: 'error',
      message: `Deleted administration account failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Deleted administration account failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Delete Administration Account',
    status: 'success',
    message: `Administration account succesfully deleted! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Administration account succesfully deleted!',
  });
};
