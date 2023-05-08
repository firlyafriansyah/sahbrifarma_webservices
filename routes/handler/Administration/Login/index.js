const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { AdministrationAccount, LoginStatus } = require('../../../../models');
const { LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(409).json({
      status: 'error',
      message: validate,
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: req.body.username },
  });

  if (!administrationAccount) {
    await LogsCreator(null, null, 'Administration Account Login', 'error', 'This administration account not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account not found!',
    });
  }

  const isValidPassword = await bcrypt.compare(req.body.password, administrationAccount.password);

  if (!isValidPassword) {
    await LogsCreator(administrationAccount.uidAdministrationAccount, null, 'Administration Account Login', 'error', 'Password not match with this administration account!');

    return res.status(406).json({
      status: 'error',
      message: 'Password not match with this administration account!',
    });
  }

  if (administrationAccount.status === 'inactive') {
    await LogsCreator(administrationAccount.uidAdministrationAccount, null, 'Administration Account Login', 'error', 'This administration account status is inactive!');

    return res.status(403).json({
      status: 'error',
      message: 'This administration account status is inactive!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
  });

  if (!loginStatus) {
    await LogsCreator(administrationAccount.uidAdministrationAccount, null, 'Administration Account Login', 'error', 'This administration account does\'t have login status!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration does\'t have login status!',
    });
  }

  if (loginStatus.loggedIn) {
    await LogsCreator(administrationAccount.uidAdministrationAccount, null, 'Administration Account Login', 'error', 'This administration account is already logged in on another device!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account is already logged in on another device!',
    });
  }

  const updateLastUpdate = await loginStatus.update({
    lastUpdate: administrationAccount.updatedAt,
  });

  if (!updateLastUpdate) {
    await LogsCreator(administrationAccount.uidAdministrationAccount, null, 'Administration Account Login', 'error', 'This administration account failed update las update on login status!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account failed update las update on login status!',
    });
  }

  await loginStatus.update({
    loggedIn: true,
  });

  await LogsCreator(administrationAccount.uidAdministrationAccount, null, 'Administration Account Login', 'success', 'This administration account successfully logged in!');

  return res.json({
    status: 'success',
    data: {
      username: administrationAccount.username,
      role: administrationAccount.role,
    },
  });
};
