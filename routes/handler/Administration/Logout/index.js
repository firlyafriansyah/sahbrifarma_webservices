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
      action: 'Logout',
      status: 'error',
      message: `Administration account with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account with this uid not found!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  if (!loginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Logout',
      status: 'error',
      message: `Login status for this administration account with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Login status for this administration account with this uid not found!',
    });
  }

  if (!loginStatus.loggedIn) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Logout',
      status: 'error',
      message: `This administration account is'nt logged in on any device! (target: ${uid})`,
    });

    return res.status(406).json({
      status: 'error',
      message: 'This administration account is\'nt logged in on any device!',
    });
  }

  const updateLoginStatus = await loginStatus.update({
    loggedIn: false,
  });

  if (!updateLoginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Logout',
      status: 'error',
      message: `Update administration account login status failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Update administration account login status failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Logout',
    status: 'success',
    message: `Logout from this administration account success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Logout from this administration account success!',
  });
};
