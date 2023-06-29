const { MedicalTest, Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const medicalTest = await MedicalTest.findOne({
        where: { uidMedicalTest: uid },
      }, { transaction: t, lock: true });

      if (!medicalTest) {
        throw new Error('Hasil periksa kesehatan tidak ditemukan!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient: medicalTest.uidPatient },
        attributes: ['name', 'date_of_birth', 'sex'],
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      await LogsCreator(User, uid, 'Get Medical Test Target', 'success', 'Hasil periksa kesehatan berhasil di dapatkan!');

      return res.json({
        status: 'success',
        data: {
          patient,
          medicalTest,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Get Medical Test Target', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
