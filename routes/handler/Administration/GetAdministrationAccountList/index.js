const { Op } = require('sequelize');
const { AdministrationAccount, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const administrationAccount = await AdministrationAccount.findAll({
    where: { role: { [Op.not]: 'super-admin' } },
    attributes: ['username', 'role', ['updated_at', 'updatedAt']],
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Get All Administration Account',
      status: 'error',
      message: 'Administration account list not found!',
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account list not found!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
    action: 'Get All Administration Account',
    status: 'success',
    message: 'Get administration account list success!',
  });

  return res.json({
    status: 'success',
    data: administrationAccount,
  });
};
