const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { AdministrationAccount, Logs, LoginStatus } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: 'error',
      message: validate,
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: req.body.username },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Login',
      status: 'error',
      message: `Administration account not found! (target: ${req.body.username})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  const isValidPassword = await bcrypt.compare(req.body.password, administrationAccount.password);

  if (!isValidPassword) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Login',
      status: 'error',
      message: `Password not match with this account! (target: ${req.body.username})`,
    });

    return res.status(406).json({
      status: 'error',
      message: 'Password not match with this account!',
    });
  }

  if (administrationAccount.status === 'inactive') {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Login',
      status: 'error',
      message: `This account on inactive status! (target: ${User})`,
    });

    return res.status(403).json({
      status: 'error',
      message: 'This account on inactive status!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uid },
  });

  if (!loginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Login',
      status: 'error',
      message: `Login status for this administration account not found! (target: ${req.body.username})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Login status for this administration account not found!',
    });
  }

  if (loginStatus.loggedIn) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Login',
      status: 'error',
      message: `This account already logged in on another device! (target: ${req.body.username})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account already logged in on another device!',
    });
  }

  const updateLastUpdate = await loginStatus.update({
    lastUpdate: administrationAccount.updatedAt,
  });

  if (!updateLastUpdate) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Login',
      status: 'error',
      message: `Failed update last update on this account! (target: ${User})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Failed update last update on this account!!',
    });
  }

  await loginStatus.update({
    loggedIn: true,
  });

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Login',
    status: 'success',
    message: `Login success! (target: ${req.body.username})`,
  });

  return res.json({
    status: 'success',
    data: {
      username: administrationAccount.username,
      role: administrationAccount.role,
    },
  });
};
