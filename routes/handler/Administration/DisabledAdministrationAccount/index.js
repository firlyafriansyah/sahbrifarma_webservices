const { AdministrationAccount, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Disabled Administration Account',
      status: 'error',
      message: `Administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  const disabledAdministrationAccount = await administrationAccount.update({
    status: 'inactive',
  });

  if (!disabledAdministrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Disabled Administration Account',
      status: 'error',
      message: `Disabled administration account failed! (target: ${uid})`,
    });

    return res.status(403).json({
      status: 'error',
      message: 'Disabled administration account failed!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
    action: 'Disabled Administration Account',
    status: 'success',
    message: `Administration account succesfully disabled! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Administration account succesfully disabled!',
  });
};
