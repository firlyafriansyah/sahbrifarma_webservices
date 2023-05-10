const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { Decryptor, LogsCreator } = require('../../../../utils');
const { AdministrationAccount, LoginStatus } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
    role: { type: 'enum', values: ['frontdesk', 'nurse', 'doctor', 'pharmacist'] },
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(403).json({
      status: 'error',
      message: validate,
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: req.body.username },
  });

  if (administrationAccount) {
    throw new Error('This username already used by another administration account!');
  }

  const password = await bcrypt.hash(req.body.password, 10);

  const createAdministrationAccount = await AdministrationAccount.create({
    username: req.body.username,
    password,
    role: req.body.role,
    status: 'active',
  });

  if (!createAdministrationAccount) {
    throw new Error('Failed registered this administration account!');
  }

  const createLoginStatus = await LoginStatus.create({
    uidAdministrationAccount: createAdministrationAccount.uid,
    loggedIn: false,
  });

  if (!createLoginStatus) {
    throw new Error('Failed created login status for this administration account!');
  }

  await LogsCreator(User, null, 'Register Administration Account', 'success', 'Successfully registered this administration account!');

  return res.json({
    status: 'success',
    data: {
      username: createAdministrationAccount.username,
      role: createAdministrationAccount.role,
      loggedIn: createLoginStatus.loggedIn,
      status: createLoginStatus.status,
    },
  });
};
