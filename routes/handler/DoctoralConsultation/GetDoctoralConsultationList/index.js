const {
  DoctoralConsultation, Patient, sequelize,
} = require('../../../../models');
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

      const doctoralConsultationList = await DoctoralConsultation.findAll({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!doctoralConsultationList || doctoralConsultationList.length <= 0) {
        throw new Error('Daftar hasil konsultasi dan periksa kesehatan lanjutan tidak ditemukan!');
      }

      await LogsCreator(User, uidPatient, 'Get Doctoral Consultation List', 'success', 'Daftar hasil konsultasi dan periksa kesehatan lanjutan berhasil di dapatkan!');

      return res.json({
        status: 'success',
        data: {
          patient,
          doctoralConsultationList,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Get Doctoral Consultation List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
