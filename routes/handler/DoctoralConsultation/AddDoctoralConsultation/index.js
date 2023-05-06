const { PatientIdentity, DoctoralConsultation, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, notes,
  } = req.body;

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid: uidPatient },
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Created Doctoral Consultation',
      status: 'error',
      message: `Patient with this patient uid not found! (target: ${uidPatient})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient with this patient uid not found!',
    });
  }

  const createDoctoralConsultation = await DoctoralConsultation.create({
    uidPatient,
    allergies,
    anamnesis,
    diagnosis,
    notes,
  });

  if (!createDoctoralConsultation) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Created Doctoral Consultation',
      status: 'error',
      message: `Create doctoral consultation test failed! (target: ${uidPatient})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Create doctoral consultation test failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Created Doctoral Consultation',
    status: 'success',
    message: `Create doctoral consultation success! (target: ${uidPatient})`,
  });

  return res.json({
    status: 'success',
    data: createDoctoralConsultation,
  });
};
