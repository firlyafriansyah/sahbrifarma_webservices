const { AdministrationAccount, Logs, LoginStatus } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authentication } = req.headers;
  const { Head, Tail } = Decryptor(authentication, 'authentication');

  if (!authentication) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Super Admin Middleware',
      status: 'error',
      message: `Authentication not found! (target: ${Head})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Authentication not found!',
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: Head },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `Administration account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  if (Tail !== administrationAccount.password) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `Password not match with this account! (target: ${Head})`,
    });

    return res.status(406).json({
      status: 'error',
      message: 'Password not match with this account!',
    });
  }

  if (administrationAccount.status === 'inactive') {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `This account on inactive status! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account on inactive status!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  if (!loginStatus) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `Login status for this administration account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Login status for this administration account not found!',
    });
  }

  if (!loginStatus.loggedIn) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `This account is not logged in on any device! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account is not logged in on any device!',
    });
  }

  if (administrationAccount.updatedAt.toString() !== loginStatus.lastUpdate.toString()) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `This account recently updated, please re-login! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account recently updated, please re-login!',
    });
  }

  await loginStatus.update({
    loggedIn: true,
  });

  await Logs.create({
    administrationAccount: Head || 'Guest',
    action: 'Auto Login',
    status: 'success',
    message: `Login success! (target: ${Head})`,
  });

  return res.json({
    status: 'success',
    data: {
      username: administrationAccount.username,
      role: administrationAccount.role,
    },
  });
};
