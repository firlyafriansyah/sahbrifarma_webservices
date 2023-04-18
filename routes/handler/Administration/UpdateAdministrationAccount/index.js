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

  const { uid } = req.params;

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `Administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  const checkName = await AdministrationAccount.findOne({
    where: { username: req.body.username },
  });

  if (checkName && checkName.username !== administrationAccount.username) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `This username already used! (target: ${uid}`,
    });

    return res.status(400).json({
      status: 'error',
      message: 'This username already used!',
    });
  }

  const password = await bcrypt.hash(req.body.password, 10);

  if (req.body.username === checkName.username && req.body.role === checkName.role
    && await bcrypt.compare(req.body.password, checkName.password)) {
    return res.json({
      status: 'success',
      message: 'Administration account data same with existing data!',
    });
  }

  const updateAdministrationAccount = await administrationAccount.update({
    password,
    username: req.body.username,
    role: req.body.role,
  });

  if (!updateAdministrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `Administration account failed updated! (target: ${uid})`,
    });

    return res.status(400).json({
      status: 'error',
      message: 'Administration account failed updated!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
    action: 'Update Administration Account',
    status: 'success',
    message: `Update administration account successfully updated! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: {
      username: updateAdministrationAccount.username,
      role: updateAdministrationAccount.role,
    },
  });
};
