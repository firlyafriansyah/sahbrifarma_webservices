const { MedicalTest, Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      const medicalTestList = await MedicalTest.findAll({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!medicalTestList || medicalTestList.length <= 0) {
        throw new Error('Daftar hasil periksa kesehatan tidak ditemukan!');
      }

      await LogsCreator(User, uidPatient, 'Get Medical Test List', 'success', 'Daftar hasil periksa kesehatan berhasil di dapatkan');

      return res.json({
        status: 'success',
        data: {
          patient,
          medicalTestList,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Get Medical Test List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
