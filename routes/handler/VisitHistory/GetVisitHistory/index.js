const { VisitHistory } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const visitHistory = await VisitHistory.findAll({
    where: { uidPatient },
  });

  if (!visitHistory) {
    await LogsCreator(User, uidPatient, 'Get Visit History', 'error', 'Riwayat kunjungan pasien tidak ditemukan!');

    return res.status(404).json({
      status: 'error',
      message: 'Riwayat kunjungan pasien tidak ditemukan!',
    });
  }

  await LogsCreator(User, uidPatient, 'Get Patient Detail', 'success', 'Berhasil mengambil daftar riwayat kunjungan pasien!');

  return res.json({
    status: 'success',
    data: visitHistory,
  });
};
