const { Patient, MedicalTest, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    bodyHeight, bodyWeight, bodyTemperature, bloodPressure, bloodSugar, uricAcid, cholesterol,
  } = req.body;

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('This patient target not found!');
      }

      const createMedicalTest = await MedicalTest.create({
        uidPatient,
        bodyHeight,
        bodyWeight,
        bodyTemperature,
        bloodPressure,
        bloodSugar,
        uricAcid,
        cholesterol,
      }, { transaction: t, lock: true });

      if (!createMedicalTest) {
        throw new Error('Failed create medical test for this patient target!');
      }

      await LogsCreator(User, uidPatient, 'Create Medical Test', 'success', 'Successfully created medical test for this patient target!');

      return res.json({
        status: 'success',
        data: createMedicalTest,
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Create Medical Test', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
