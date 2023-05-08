const { AdministrationAccount, LoginStatus } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uidAdministrationAccount: uid },
  });

  if (!administrationAccount) {
    await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'error', 'Administration Account not found!');

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  if (administrationAccount.role === 'super-admin') {
    await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'error', 'Can\'t actived administration account with role super admin!');

    return res.status(409).json({
      status: 'error',
      message: 'Can\'t actived administration account with role super admin!',
    });
  }

  const loginStatus = await LoginStatus.findOne({
    where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
  });

  if (!loginStatus) {
    await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'error', 'This administration account doesn\'t have login status!');

    return res.status(404).json({
      status: 'error',
      message: 'This administration account doesn\'t have login status!',
    });
  }

  if (administrationAccount.status === 'active') {
    await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'error', 'This administration account already has an active status!');

    return res.status(409).json({
      status: 'error',
      message: 'This administration account already has an active status!',
    });
  }

  const activedAdministrationAccount = await administrationAccount.update({
    status: 'active',
  });

  if (!activedAdministrationAccount) {
    await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'error', 'Actived this administration account failed!');

    return res.status(409).json({
      status: 'error',
      message: 'Actived this administration account failed!',
    });
  }

  const updateLoginStatus = await loginStatus.update({
    loggedIn: false,
  });

  if (!updateLoginStatus) {
    await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'error', 'Updated login status for this administration account failed!');

    return res.status(409).json({
      status: 'error',
      message: 'Updated login status for this administration account failed!',
    });
  }

  await LogsCreator(User, administrationAccount.uidAdministrationAccount, 'Actived Administration Account', 'success', 'Successfully actived this administration account!');

  return res.json({
    status: 'success',
    message: 'Successfully actived this administration account!',
  });
};
