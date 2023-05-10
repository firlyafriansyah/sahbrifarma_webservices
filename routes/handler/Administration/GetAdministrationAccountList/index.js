const { Op } = require('sequelize');
const { AdministrationAccount } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const administrationAccount = await AdministrationAccount.findAll({
    where: { role: { [Op.not]: 'super-admin' } },
    attributes: ['uid', 'username', 'role', 'status', ['updated_at', 'updatedAt']],
  });

  if (!administrationAccount) {
    throw new Error('Administration account list not found!');
  }

  await LogsCreator(User, null, 'Get Administration List', 'success', 'Successfully get administration list!');

  return res.json({
    status: 'success',
    data: administrationAccount,
  });
};
