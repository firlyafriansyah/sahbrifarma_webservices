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
    await LogsCreator(User, null, 'Register Administration Account', 'error', 'This username already used by another administration account!');
  }

  const password = await bcrypt.hash(req.body.password, 10);

  const createAdministrationAccount = await AdministrationAccount.create({
    username: req.body.username,
    password,
    role: req.body.role,
    status: 'active',
  });

  if (!createAdministrationAccount) {
    await LogsCreator(User, null, 'Register Administration Account', 'error', 'Failed registered this administration account!');
  }

  const createLoginStatus = await LoginStatus.create({
    uidAdministrationAccount: createAdministrationAccount.uid,
    loggedIn: false,
  });

  if (!createLoginStatus) {
    await LogsCreator(User, null, 'Register Administration Account', 'error', 'Failed create login status for this administration account!');
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
