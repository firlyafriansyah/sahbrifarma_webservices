const { Decryptor } = require('../../utils');
const { AdministrationAccount, Logs } = require('../../models');

module.exports = async (req, res, next) => {
  const { Authorization } = req.headers;
  const { Head, Tail } = Decryptor(Authorization);

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: Head },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `Administration account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  if (administrationAccount.lastUpdate !== administrationAccount.updatedAt) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Frontdesk Middleware',
      status: 'error',
      message: `This account recently updated, please re-login! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'This account recently updated, please re-login!',
    });
  }

  if (Tail !== 'nurse' && Tail !== 'super-admin') {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Frontdesk Middleware',
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
