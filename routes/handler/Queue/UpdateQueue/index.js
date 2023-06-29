const { Queue, sequelize } = require('../../../../models');
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
        throw new Error('Pasien tidak ditemukan!');
      }

      if (queue.status !== currentStatus) {
        throw new Error('Status antrean pasien salah!');
      }

      const updateQueue = await queue.update({
        status: newStatus,
      }, { transaction: t, lock: true });

      if (!updateQueue) {
        throw new Error('Update antrean pasien gagal!');
      }

      await LogsCreator(User, uid, 'Update Patient Queue', 'success', 'Update antrean pasien berhasil!');

      return res.json({
        status: 'success',
        message: 'Update antrean pasien berhasil!',
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
