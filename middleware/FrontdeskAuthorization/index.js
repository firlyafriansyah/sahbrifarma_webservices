const { Decryptor } = require('../../utils');
const { AdministrationAccount, Logs, LoginStatus } = require('../../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const { Head, Tail } = Decryptor(authorization);

  // CHECK REQUEST HEADERS
  if (!authorization) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `Authorization not found! (target: ${Head})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Authorization not found!',
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: Head },
  });

  // CHECK ADMINISTRATION ACCOUNT IS EXIST
  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `This account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'This account not found!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT HAVE THIS PERMISSION
  if (Tail !== 'frontdesk' && Tail !== 'super-admin') {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `This account not have authorization for this API endpoint! (target: ${Head})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'This account not have authorization for this API endpoint!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  // CHECK LOGIN STATUS IS EXIST
  if (!loginStatus) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `Login status this account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Login status this account not found!',
    });
  }

  // CHECK LOGIN STATUS IS ACTIVE
  if (administrationAccount.status === 'inactive') {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `This account status is inactive! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account status is inactive!',
    });
  }

  // CHECK LOGIN STATUS IS LOGGED IN
  if (!loginStatus.loggedIn) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `This account not logged in on any device! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account not logged in on any device!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT NOT UPDATED LATELY
  if (loginStatus.lastUpdate.toString() !== administrationAccount.updatedAt.toString()) {
    await Logs.create({
      administrationAccount: Head || 'Guest',
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `This account recently updated, please re-login! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account recently updated, please re-login!',
    });
  }

  return next();
};
