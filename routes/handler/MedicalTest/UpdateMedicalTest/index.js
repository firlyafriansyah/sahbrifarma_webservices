const { MedicalTest, sequelize } = require('../../../../models');
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
      const medicalTest = await MedicalTest.findOne({
        where: { uidMedicalTest: uid },
      }, { transaction: t, lock: true });

      if (!medicalTest) {
        throw new Error('This medical test target not found!');
      }

      const updateMedicalTest = await medicalTest.update({
        bodyHeight,
        bodyWeight,
        bodyTemperature,
        bloodPressure,
        bloodSugar,
        uricAcid,
        cholesterol,
      }, { transaction: t, lock: true });

      if (!updateMedicalTest) {
        throw new Error('Failed update this medical test target!');
      }

      await LogsCreator(User, uid, 'Update Medical Test', 'success', 'Successfully updated medical test target!');

      return res.json({
        status: 'success',
        data: updateMedicalTest,
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
