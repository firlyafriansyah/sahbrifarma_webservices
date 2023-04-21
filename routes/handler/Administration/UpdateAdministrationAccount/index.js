const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { Decryptor } = require('../../../../utils');
const { AdministrationAccount, Logs } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
    role: { type: 'enum', values: ['frontdesk', 'nurse', 'doctor', 'pharmacist'] },
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(409).json({
      status: 'error',
      message: validate,
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `Administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  if (administrationAccount.role === 'super-admin') {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `This administration account have super admin role, you can't update or change anything on super admin account role! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'This administration account have super admin role, you can\'t update or change anything on super admin account role!',
    });
  }

  const checkName = await AdministrationAccount.findOne({
    where: { username: req.body.username },
  });

  if (checkName && checkName.username !== administrationAccount.username) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `This username already used! (target: ${uid}`,
    });

    return res.status(409).json({
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
      administrationAccount: User || 'Guest',
      action: 'Update Administration Account Data',
      status: 'error',
      message: `Administration account failed updated! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Administration account failed updated!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
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
