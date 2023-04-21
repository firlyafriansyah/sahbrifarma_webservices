const { Decryptor } = require('../../utils');
const { AdministrationAccount, Logs, LoginStatus } = require('../../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  // CHECK REQUEST HEADERS
  if (!authorization) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Doctor Middleware',
      status: 'error',
      message: `Authorization not found! (target: ${User})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Authorization not found!',
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: User },
  });

  // CHECK ADMINISTRATION ACCOUNT IS EXIST
  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Doctor Middleware',
      status: 'error',
      message: `This account not found! (target: ${User})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'This account not found!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT HAVE THIS PERMISSION
  if (administrationAccount.role !== 'doctor' && administrationAccount.role !== 'super-admin') {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Doctor Middleware',
      status: 'error',
      message: `This account not have authorization for this API endpoint! (target: ${User})`,
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
      administrationAccount: User || 'Guest',
      action: 'Doctor Middleware',
      status: 'error',
      message: `Login status this account not found! (target: ${User})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Login status this account not found!',
    });
  }

  // CHECK LOGIN STATUS IS ACTIVE
  if (administrationAccount.status === 'inactive') {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Super Admin Middleware',
      status: 'error',
      message: `This account status is inactive! (target: ${User})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account status is inactive!',
    });
  }

  // CHECK LOGIN STATUS IS LOGGED IN
  if (!loginStatus.loggedIn) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Doctor Middleware',
      status: 'error',
      message: `This account not logged in on any device! (target: ${User})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account not logged in on any device!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT NOT UPDATED LATELY
  if (loginStatus.lastUpdate.toString() !== administrationAccount.updatedAt.toString()) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Doctor Middleware',
      status: 'error',
      message: `This account recently updated, please re-login! (target: ${User})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account recently updated, please re-login!',
    });
  }

  return next();
};
