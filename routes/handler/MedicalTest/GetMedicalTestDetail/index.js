const { MedicalTest, PatientIdentity, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const medicalTest = await MedicalTest.findOne({
    where: { uid },
  });

  if (!medicalTest) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Medical Test Detail',
      status: 'error',
      message: `Medical test with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Medical test with this uid not found!',
    });
  }

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid: medicalTest.uidPatient },
    attributes: ['name', 'date_of_birth', 'sex'],
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Medical Test Detail',
      status: 'error',
      message: `Patient identity with this medical test uid patient not found! (target: ${medicalTest.uidPatient})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient identity with this medical test uid patient not found!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Get Medical Test Detail',
    status: 'success',
    message: `Get medical test detail success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: {
      patientIdentity,
      medicalTest,
    },
  });
};
