const { Op } = require('sequelize');
const { AdministrationAccount } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const administrationAccount = await AdministrationAccount.findAll({
    where: { role: { [Op.not]: 'super-admin' } },
    attributes: ['uid_administration_account', 'username', 'fullname', 'role', 'status', ['updated_at', 'updatedAt']],
  });

  if (!administrationAccount) {
    await LogsCreator(User, null, 'Get Administration List', 'error', 'Daftar akun administrasi tidak ditemukan!');
  }

  await LogsCreator(User, null, 'Get Administration List', 'success', 'Daftar akun administrasi berhasil didapatkan!');

  return res.json({
    status: 'success',
    data: administrationAccount,
  });
};
