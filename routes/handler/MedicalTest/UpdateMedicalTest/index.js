const { MedicalTest, AdministrationAccount, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    bodyHeight, bodyWeight, bodyTemperature, bloodPressure, bloodSugar, uricAcid, cholesterol,
  } = req.body;

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      });

      if (!administrationAccount) {
        throw new Error('Akun tidak ditemukan!');
      }

      const medicalTest = await MedicalTest.findOne({
        where: { uidMedicalTest: uid },
      }, { transaction: t, lock: true });

      if (!medicalTest) {
        throw new Error('Hasil periksa kesehatan tidak ditemukan!');
      }

      const updateMedicalTest = await medicalTest.update({
        bodyHeight,
        bodyWeight,
        bodyTemperature,
        bloodPressure,
        bloodSugar,
        uricAcid,
        cholesterol,
        createdBy: AdministrationAccount.fullname,
      }, { transaction: t, lock: true });

      if (!updateMedicalTest) {
        throw new Error('Update hasil periksa kesehatan gagal!');
      }

      await LogsCreator(User, uid, 'Update Medical Test', 'success', 'Update hasil periksa kesehatan berhasil!');

      return res.json({
        status: 'success',
        message: 'Update hasil periksa kesehatan berhasil!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Medical Test', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
