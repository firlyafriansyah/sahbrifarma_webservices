const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { Decryptor } = require('../../../../utils');
const { AdministrationAccount, Logs } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
    role: { type: 'enum', values: ['frontdesk', 'nurse', 'doctor', 'pharmacist'] },
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

  if (administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Register',
      status: 'error',
      message: `This username already used! (target: ${req.body.username})`,
    });

    return res.status(400).json({
      status: 'error',
      message: 'This username already used!',
    });
  }

  const password = await bcrypt.hash(req.body.password, 10);

  const createAdministrationAccount = await AdministrationAccount.create({
    username: req.body.username,
    password,
    role: req.body.role,
    loggedIn: false,
  });

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head,
    action: 'Register',
    status: 'success',
    message: `Administration account successfully registered! (target: ${req.body.username})`,
  });

  return res.json({
    status: 'success',
    data: {
      username: createAdministrationAccount.username,
      role: createAdministrationAccount.role,
    },
  });
};
