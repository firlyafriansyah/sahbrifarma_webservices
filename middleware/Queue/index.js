const { Decryptor, LogsCreator } = require('../../utils');
const {
  AdministrationAccount, LoginStatus,
} = require('../../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const { uid, currentStatus, newStatus } = req.params;
  const { User } = Decryptor(authorization);

  // CHECK REQUEST HEADERS
  if (!authorization) {
    await LogsCreator(null, null, 'Queue Middleware', 'error', 'Authorization not found!');

    return res.status(404).json({
      status: 'error',
      message: 'Authorization not found!',
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uidAdministrationAccount: User },
  });

  // CHECK ADMINISTRATION ACCOUNT IS EXIST
  if (!administrationAccount) {
    await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account not found!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT HAVE THIS PERMISSION
  if (uid) {
    if (administrationAccount.role === 'frontdesk') {
      if (currentStatus === 'out_of_queue') {
        if (newStatus !== 'in_medical_test_queue' && newStatus !== 'in_pharmacist_queue') {
          await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account doesn\'t have authorization for this endpoint!');

          return res.status(401).json({
            status: 'error',
            message: 'This administration account doesn\'t have authorization for this endpoint!',
          });
        }
      } else {
        await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account doesn\'t have authorization for this endpoint!');

        return res.status(401).json({
          status: 'error',
          message: 'This administration account doesn\'t have authorization for this endpoint!',
        });
      }
    } else if (administrationAccount.role === 'nurse') {
      if (currentStatus !== 'in_medical_test_queue' && newStatus !== 'in_doctoral_consultation_queue') {
        await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account doesn\'t have authorization for this endpoint!');

        return res.status(401).json({
          status: 'error',
          message: 'This administration account doesn\'t have authorization for this endpoint!',
        });
      }
    } else if (administrationAccount.role === 'doctor') {
      if (currentStatus !== 'in_doctoral_consultation_queue' && newStatus !== 'in_pharmacist_queue') {
        await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account doesn\'t have authorization for this endpoint!');

        return res.status(401).json({
          status: 'error',
          message: 'This administration account doesn\'t have authorization for this endpoint!',
        });
      }
    } else if (administrationAccount.role === 'pharmacist') {
      if (currentStatus !== 'in_pharmacist_queue' && newStatus !== 'out_of_queue') {
        await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account doesn\'t have authorization for this endpoint!');

        return res.status(401).json({
          status: 'error',
          message: 'This administration account doesn\'t have authorization for this endpoint!',
        });
      }
    }
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
  });

  // CHECK LOGIN STATUS IS EXIST
  if (!loginStatus) {
    await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account isn\'t have login status!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account isn\'t have login status!',
    });
  }

  // CHECK ADMINISTRATION ACCOUNT NOT UPDATED LATELY
  if (loginStatus.lastUpdate.toString() !== administrationAccount.updatedAt.toString()) {
    await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account recently updated, please re-login!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account recently updated, please re-login!',
    });
  }

  // CHECK LOGIN STATUS IS ACTIVE
  if (administrationAccount.status === 'inactive') {
    await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account status is inactive!');

    return res.status(409).json({
      status: 'error',
      message: 'This account status is inactive!',
    });
  }

  // CHECK LOGIN STATUS IS LOGGED IN
  if (!loginStatus.loggedIn) {
    await LogsCreator(User, null, 'Queue Middleware', 'error', 'This administration account isn\'t currently logged in on any device!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account isn\'t currently logged in on any device!',
    });
  }

  return next();
};
