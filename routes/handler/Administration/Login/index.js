const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { AdministrationAccount, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
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
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
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
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Login',
      status: 'error',
      message: `Password not match with this account! (target: ${req.body.username})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Password not match with this account!',
    });
  }

  if (administrationAccount.status === 'inactive') {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Auto Login',
      status: 'error',
      message: `This account on inactive status! (target: ${Head})`,
    });

    return res.status(403).json({
      status: 'error',
      message: 'This account on inactive status!',
    });
  }

  if (administrationAccount.loggedIn) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Login',
      status: 'error',
      message: `This account already logged in on another device! (target: ${req.body.username})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'This account already logged in on another device!',
    });
  }

  const updateLastUpdate = await administrationAccount.update({
    lastUpdate: administrationAccount.updatedAt,
  })

  if (!updateLastUpdate) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Login',
      status: 'error',
      message: `Failed update last update on this account! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Failed update last update on this account!!',
    });
  }

  await administrationAccount.update({
    loggedIn: true,
  });

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
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
