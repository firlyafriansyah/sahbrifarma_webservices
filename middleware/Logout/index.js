const { Decryptor, LogsCreator } = require('../../utils');
const { AdministrationAccount, LoginStatus } = require('../../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const { uid } = req.params;
  const { User } = Decryptor(authorization);

  // CHECK REQUEST HEADERS
  if (!authorization) {
    await LogsCreator(null, null, 'Logout Middleware', 'error', 'Authorization not found!');

    return res.status(401).json({
      status: 'error',
      message: 'Authorization not found!',
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uidAdministrationAccount: User },
  });

  const administrationAccountFromUid = await AdministrationAccount.findOne({
    where: { uidAdministrationAccount: uid },
  });

  // CHECK ADMINISTRATION ACCOUNT IS EXIST
  if (!administrationAccount || !administrationAccountFromUid) {
    await LogsCreator(User, null, 'Logout Middleware', 'error', 'This administration account not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account not found!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT HAVE THIS PERMISSION
  if (administrationAccount.role !== administrationAccountFromUid.role && administrationAccount.role !== 'super-admin') {
    await LogsCreator(User, null, 'Logout Middleware', 'error', 'This administration account doesn\'t have authorization for this endpoint!');

    return res.status(401).json({
      status: 'error',
      message: 'This administration account doesn\'t have authorization for this endpoint!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
  });

  // CHECK LOGIN STATUS IS EXIST
  if (!loginStatus) {
    await LogsCreator(User, null, 'Logout Middleware', 'error', 'This administration account doesn\'t have login status!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account doesn\'t have login status!',
    });
  }

  // CHECK LOGIN STATUS IS ACTIVE
  if (administrationAccount.status === 'inactive') {
    await LogsCreator(User, null, 'Logout Middleware', 'error', 'This administration account status is inactive!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account status is inactive!',
    });
  }

  // CHECK LOGIN STATUS IS LOGGED IN
  if (!loginStatus.loggedIn) {
    await LogsCreator(User, null, 'Logout Middleware', 'error', 'This administration account isn\'t currently logged in on any device!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account isn\'t currently logged in on any device!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT NOT UPDATED LATELY
  if (loginStatus.lastUpdate.toString() !== administrationAccount.updatedAt.toString()) {
    await LogsCreator(User, null, 'Logout Middleware', 'error', 'This administration account recently updated, please re-login!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account recently updated, please re-login!',
    });
  }

  return next();
};
