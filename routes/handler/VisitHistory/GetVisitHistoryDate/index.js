const { AdministrationAccount, VisitHistory, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const visitHistory = await VisitHistory.findAll({
        where: { uidPatient },
        attributes: ['visitDate'],
      }, { transaction: t, lock: true });

      if (!visitHistory) {
        throw new Error('Riwayat kunjungan pasien tidak ditemukan!!');
      }

      await LogsCreator(User, null, 'Get Queue List', 'success', 'Daftar antrean berhasil di dapatkan!');

      return res.json({
        status: 'success',
        data: visitHistory,
      });
    });
  } catch (error) {
    await LogsCreator(User, null, 'Get Queue List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
