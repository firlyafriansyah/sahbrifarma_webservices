const Validator = require('fastest-validator');
const { MedicalTest, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    bodyHeight, bodyWeight, bodyTemperature, bloodPressure, bloodSugar, uricAcid, cholesterol,
  } = req.body;

  const schema = {
    bodyHeight: 'number|empty:false',
    bodyWeight: 'number|empty:false',
    bodyTemperature: 'number|empty:false',
    bloodPressure: 'number|empty:false',
    bloodSugar: 'number|empty:false',
    uricAcid: 'number|empty:false',
    cholesterol: 'number|empty:false',
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(403).json({
      status: 'error',
      message: validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const medicalTest = await MedicalTest.findOne({
        where: { uid },
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
