const { AdministrationAccount, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
    attributes: ['username', 'role', ['updated_at', 'updatedAt']],
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Get Administration Account',
      status: 'error',
      message: `Administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
    action: 'Get Administration Account',
    status: 'success',
    message: `Get administration account success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: administrationAccount,
  });
};
