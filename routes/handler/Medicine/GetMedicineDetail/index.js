const { sequelize, Patient, Medicine } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const medicine = await Medicine.findOne({
        where: { uidMedicine: uid },
      }, { transaction: t, lock: true });

      if (!medicine) {
        throw new Error('Permintaan obat tidak ditemukan!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient: medicine.uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      await LogsCreator(User, uid, 'Get Medicine Detail', 'success', 'Detail permintaan obat berhasil di dapatkan!');

      return res.json({
        status: 'success',
        data: {
          patient,
          medicine,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Get Medicine Detail', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
