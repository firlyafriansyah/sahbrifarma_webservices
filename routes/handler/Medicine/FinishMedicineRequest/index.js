const {
  sequelize, Medicine, Queue, Patient, AdministrationAccount, VisitHistory,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient: uid },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      const medicine = await Medicine.findOne({
        where: { uidPatient: patient.uidPatient },
      }, { transaction: t, lock: true });

      if (!medicine) {
        throw new Error('Permintaan obat tidak ditemukan!');
      }

      const queue = await Queue.findOne({
        where: { uidPatient: patient.uidPatient },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('Pasien tidak dalam antrean!');
      }

      if (medicine.status !== 'requested') {
        throw new Error('Status permintaan obat salah!');
      }

      const updateMedicine = await medicine.update({
        status: 'finished',
        preparedBy: administrationAccount.fullname,
      }, { transaction: t, lock: true });

      if (!updateMedicine) {
        throw new Error('Update status permintaan obat gagal!');
      }

      const visitHistory = await VisitHistory.create({
        uidPatient: patient.uidPatient,
        uidMedicalType: medicine.uidMedicine,
        visitDate: new Date(),
        medicalType: 'Beli Obat',
      }, { transaction: t, lock: true });

      if (!visitHistory) {
        throw new Error('Riwayat kunjungan gagal dibuat!');
      }

      const updateQueue = await queue.update({
        status: 'out_of_queue',
      }, { transaction: t, lock: true });

      if (!updateQueue) {
        throw new Error('Update antrean pasien gagal!');
      }

      await LogsCreator(User, uid, 'Finish Medicine Request', 'success', 'Update status permintaan obat berhasil!');

      return res.json({
        status: 'success',
        message: 'Update status permintaan obat berhasil!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Finish Medicine Request', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
