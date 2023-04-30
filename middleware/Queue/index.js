const { Decryptor } = require('../../utils');
const {
  AdministrationAccount, Logs, LoginStatus,
} = require('../../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const { uid, currentStatus, newStatus } = req.params;
  const { User } = Decryptor(authorization);

  // CHECK REQUEST HEADERS
  if (!authorization) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Queue Middleware',
      status: 'error',
      message: `Authorization not found! (target: ${User})`,
    });

    return res.status(404).json({
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
      action: 'Queue Middleware',
      status: 'error',
      message: `This administration account not found! (target: ${User})`,
    });

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
          await Logs.create({
            administrationAccount: User || 'Guest',
            action: 'Queue Middleware',
            status: 'error',
            message: `This administration account not authorize for this action! (target: ${User})`,
          });

          return res.status(401).json({
            status: 'error',
            message: 'This administration account not authorize for this action!',
          });
        }
      } else {
        await Logs.create({
          administrationAccount: User || 'Guest',
          action: 'Queue Middleware',
          status: 'error',
          message: `This administration account not authorize for this action! (target: ${User})`,
        });

        return res.status(401).json({
          status: 'error',
          message: 'This administration account not authorize for this action!',
        });
      }
    } else if (administrationAccount.role === 'nurse') {
      if (currentStatus !== 'in_medical_test_queue' && newStatus !== 'in_doctoral_consultation_queue') {
        await Logs.create({
          administrationAccount: User || 'Guest',
          action: 'Queue Middleware',
          status: 'error',
          message: `This administration account not authorize for this action! (target: ${User})`,
        });

        return res.status(401).json({
          status: 'error',
          message: 'This administration account not authorize for this action!',
        });
      }
    } else if (administrationAccount.role === 'doctor') {
      if (currentStatus !== 'in_doctoral_consultation_queue' && newStatus !== 'in_pharmacist_queue') {
        await Logs.create({
          administrationAccount: User || 'Guest',
          action: 'Queue Middleware',
          status: 'error',
          message: `This administration account not authorize for this action! (target: ${User})`,
        });

        return res.status(401).json({
          status: 'error',
          message: 'This administration account not authorize for this action!',
        });
      }
    } else if (administrationAccount.role === 'pharmacist') {
      if (currentStatus !== 'in_pharmacist_queue' && newStatus !== 'out_of_queue') {
        await Logs.create({
          administrationAccount: User || 'Guest',
          action: 'Queue Middleware',
          status: 'error',
          message: `This administration account not authorize for this action! (target: ${User})`,
        });

        return res.status(401).json({
          status: 'error',
          message: 'This administration account not authorize for this action!',
        });
      }
    }
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  // CHECK LOGIN STATUS IS EXIST
  if (!loginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Logout Middleware',
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
      action: 'Logout Middleware',
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

  return next();
};
