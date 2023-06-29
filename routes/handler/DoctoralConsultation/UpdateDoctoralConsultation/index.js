const { DoctoralConsultation, AdministrationAccount, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, medicalTreatment, notes,
  } = req.body;

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const doctoralConsultation = await DoctoralConsultation.findOne({
        where: { uidDoctoralConsultation: uid },
      }, { transaction: t, lock: true });

      if (!doctoralConsultation) {
        throw new Error('Hasil konsultasi dan periksa kesehatan lanjutan tidak ditemukan!');
      }

      const updateDoctoralConsultation = await doctoralConsultation.update({
        allergies,
        anamnesis,
        diagnosis,
        medicalTreatment,
        notes,
        createdBy: administrationAccount.fullname,
      }, { transaction: t, lock: true });

      if (!updateDoctoralConsultation) {
        throw new Error('Update hasil konsultasi dan periksa kesehatan lanjutan gagal!');
      }

      await LogsCreator(User, uid, ' Update Doctoral Cosultation', 'success', 'Updated hasil konsultasi dan periksa kesehatan lanjutan berhasil!');

      return res.json({
        status: 'success',
        message: 'Updated hasil konsultasi dan periksa kesehatan lanjutan berhasil!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, ' Update Doctoral Cosultation', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
