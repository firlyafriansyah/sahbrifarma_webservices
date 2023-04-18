const { Decryptor } = require('../../utils');
const { AdministrationAccount, Logs } = require('../../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;

  const { Head, Tail } = Decryptor(authorization);

  if (!authorization) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Super Admin Middleware',
      status: 'error',
      message: `Authorization not found! (target: ${Head})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Authorization not found!',
    });
  }

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: Head },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Super Admin Middleware',
      status: 'error',
      message: `Administration account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  if (administrationAccount.lastUpdate.toString() !== administrationAccount.updatedAt.toString()) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Super Admin Middleware',
      status: 'error',
      message: `This account recently updated, please re-login! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account recently updated, please re-login!',
    });
  }

  if (Tail !== 'super-admin') {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Super Admin Middleware',
      status: 'error',
      message: `This account not have authorization for this API endpoint! (target: ${Head})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'This account not have authorization for this API endpoint!',
    });
  }

  return next();
};
