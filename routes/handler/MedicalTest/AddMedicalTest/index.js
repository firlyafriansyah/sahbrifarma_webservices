const Validator = require('fastest-validator');
const { Patient, MedicalTest, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    bodyHeight, bodyWeight, bodyTemperature, bloodPressure, bloodSugar, uricAcid, cholesterol,
  } = req.body;

  const schema = {
    bodyHeight: 'number|optional',
    bodyWeight: 'number|optional',
    bodyTemperature: 'number|optional',
    bloodPressure: 'string|optional',
    bloodSugar: 'number|optional',
    uricAcid: 'number|optional',
    cholesterol: 'number|optional',
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(401).json({
      status: 'error',
      validate,
    });
  }

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
