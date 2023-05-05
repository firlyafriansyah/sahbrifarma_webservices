const { PatientIdentity, MedicalTest, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    bodyHeight, bodyWeight, bodyTemperature, bloodPressure, bloodSugar, uricAcid, cholesterol,
  } = req.body;

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid: uidPatient },
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Created Medical Test',
      status: 'error',
      message: `Patient with this patient uid not found! (target: ${uidPatient})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient with this patient uid not found!',
    });
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
  });

  if (!createMedicalTest) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Created Medical Test',
      status: 'error',
      message: `Create medical test failed! (target: ${uidPatient})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Create medical test failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Created Medical Test',
    status: 'success',
    message: `Create medical test success! (target: ${uidPatient})`,
  });

  return res.json({
    status: 'success',
    data: createMedicalTest,
  });
};
