const Validator = require('fastest-validator');
const { MedicalTest, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

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

  const medicalTest = await MedicalTest.findOne({
    where: { uid },
  });

  if (!medicalTest) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Medical Test',
      status: 'error',
      message: `Medical test with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Medical test with this uid not found!',
    });
  }

  const updateMedicalTest = await medicalTest.update({
    bodyHeight,
    bodyWeight,
    bodyTemperature,
    bloodPressure,
    bloodSugar,
    uricAcid,
    cholesterol,
  });

  if (!updateMedicalTest) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Medical Test',
      status: 'error',
      message: `Update medical test failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Update medical test failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Update Medical Test',
    status: 'error',
    message: `Update medical test success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: updateMedicalTest,
  });
};
