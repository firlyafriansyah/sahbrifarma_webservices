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
      action: 'Actived Administration Account',
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
      action: 'Actived Administration Account',
      status: 'error',
      message: `This account is super admin account, you can't disabled/actived super admin! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account is super admin account, you can\'t disabled/actived super admin!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  if (!loginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Actived Administration Account',
      status: 'error',
      message: `Login Status for this administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Login Status for this administration account not found!',
    });
  }

  if (administrationAccount.status === 'active') {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Actived Administration Account',
      status: 'error',
      message: `This administration account already on active status! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This administration account already on active status!',
    });
  }

  const disabledAdministrationAccount = await administrationAccount.update({
    status: 'active',
  });

  if (!disabledAdministrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Actived Administration Account',
      status: 'error',
      message: `Actived administration account failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Actived administration account failed!',
    });
  }

  const updateLoginStatus = await loginStatus.update({
    loggedIn: false,
  });

  if (!updateLoginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Actived Administration Account',
      status: 'error',
      message: `Updated login status for this administration account failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Updated login status for this administration account failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Actived Administration Account',
    status: 'success',
    message: `Administration account succesfully actived! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Administration account succesfully actived!',
  });
};
