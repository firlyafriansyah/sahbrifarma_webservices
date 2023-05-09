const { AdministrationAccount, LoginStatus } = require('../../../../models');
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

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uidAdministrationAccount: Uid },
  });

  if (!administrationAccount) {
    await LogsCreator(null, Uid, 'Auto Login', 'error', 'This administration account not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account not found!',
    });
  }

  if (Pass !== administrationAccount.password) {
    await LogsCreator(null, Uid, 'Auto Login', 'error', 'Password not match with this administration account!');

    return res.status(406).json({
      status: 'error',
      message: 'Password not match with this administration account!',
    });
  }

  if (administrationAccount.status === 'inactive') {
    await LogsCreator(null, Uid, 'Auto Login', 'error', 'This administration account status is inactive!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account status is inactive!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
  });

  if (!loginStatus) {
    await LogsCreator(null, Uid, 'Auto Login', 'error', 'This administration account doesn\'t have login status!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account doesn\'t have login status!',
    });
  }

  if (!loginStatus.loggedIn) {
    await LogsCreator(null, Uid, 'Auto Login', 'error', 'This administration account isn\'t currently logged in on any device!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account isn\'t currently logged in on any device!',
    });
  }

  if (administrationAccount.updatedAt.toString() !== loginStatus.lastUpdate.toString()) {
    await LogsCreator(null, Uid, 'Auto Login', 'error', 'This administration account recently updated, please re-login!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account recently updated, please re-login',
    });
  }

  await loginStatus.update({
    loggedIn: true,
  });

  await LogsCreator(null, Uid, 'Auto Login', 'success', 'This administration account successfully login with auto login!');

  return res.json({
    status: 'success',
    data: {
      username: administrationAccount.username,
      role: administrationAccount.role,
    },
  });
};
