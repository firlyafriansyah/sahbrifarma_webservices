const { AdministrationAccount, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const administrationAccountFromHeaders = req.headers.administration_account;
  const { uid } = req.params;

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(administrationAccountFromHeaders),
      action: 'Logout',
      status: 'error',
      message: `Administration account with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account with this uid not found!',
    });
  }

  if (!administrationAccount.loggedIn) {
    await Logs.create({
      administrationAccount: Decryptor(administrationAccountFromHeaders),
      action: 'Logout',
      status: 'error',
      message: `This administration account is'nt logged in on any device! (target: ${uid})`,
    });

    return res.status(406).json({
      status: 'error',
      message: 'This administration account is\'nt logged in on any device!',
    });
  }

  const updateAdministrationAccount = await administrationAccount.update({
    loggedIn: false,
  });

  if (!updateAdministrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(administrationAccountFromHeaders),
      action: 'Logout',
      status: 'error',
      message: `Update administration account logged in failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Update administration account logged in failed!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(administrationAccountFromHeaders),
    action: 'Logout',
    status: 'success',
    message: `Logout from this administration account success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Logout from this administration account success!',
  });
};
