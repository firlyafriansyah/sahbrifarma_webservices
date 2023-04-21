const { AdministrationAccount, Logs, LoginStatus } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uid },
    attributes: ['uid', 'username', 'role', 'status', ['updated_at', 'updatedAt']],
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Administration Account',
      status: 'error',
      message: `Administration account not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: uid },
    attributes: [['logged_in', 'loggedIn']],
  });

  if (!loginStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
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
    administrationAccount: User || 'Guest',
    action: 'Get Administration Account',
    status: 'success',
    message: `Get administration account success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: {
      uid: administrationAccount.uid,
      username: administrationAccount.username,
      role: administrationAccount.role,
      status: administrationAccount.status,
      updatedAt: administrationAccount.updatedAt,
      loggedIn: loginStatus.loggedIn,
    },
  });
};
