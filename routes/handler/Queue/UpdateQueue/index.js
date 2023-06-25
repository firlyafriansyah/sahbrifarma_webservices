const {
  Queue, sequelize, VisitHistory,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid, currentStatus, newStatus } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const queue = await Queue.findOne({
        where: { uidPatient: uid },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('Pasien dengan id ini tidak ditemukan!');
      }

      if (queue.status !== currentStatus) {
        throw new Error('Status antrean pasien saat ini salah!');
      }

      const updateQueue = await queue.update({
        status: newStatus,
      }, { transaction: t, lock: true });

      if (!updateQueue) {
        throw new Error('Gagal melakukan update antrean!');
      }

      if (currentStatus === 'out_of_queue') {
        console.log('test');
        const visitHistory = VisitHistory.create({
          uidPatient: uid,
          visitDate: new Date(),
          medicalType: newStatus === 'in_medical_test_queue' ? 'Medical Test' : 'Buy Medicine',
          status: 'on_progress',
        }, { transaction: t, lock: true });

        if (!visitHistory) {
          throw new Error('Gagal membuat riwayat kunjungan untuk pasien!');
        }
      }

      await LogsCreator(User, uid, 'Update Patient Queue', 'success', 'Berhasil update antrean pasien!');

      return res.json({
        status: 'success',
        message: 'Berhasil update antrean pasien!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Patient Queue', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
