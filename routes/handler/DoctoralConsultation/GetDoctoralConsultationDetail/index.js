const { DoctoralConsultation, PatientIdentity, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const doctoralConsultation = await DoctoralConsultation.findOne({
    where: { uid },
  });

  if (!doctoralConsultation) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Doctoral Consultation Detail',
      status: 'error',
      message: `Doctoral consultation with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Doctoral consultation with this uid not found!',
    });
  }

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid: doctoralConsultation.uidPatient },
    attributes: ['name', 'date_of_birth', 'sex'],
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Doctoral Consultation Detail',
      status: 'error',
      message: `Patient identity with this doctoral consultation uid patient not found! (target: ${doctoralConsultation.uidPatient})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient identity with this doctoral consultation uid patient not found!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Get Doctoral Consultation Detail',
    status: 'success',
    message: `Get doctoral consultation detail success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: {
      patientIdentity,
      doctoralConsultation,
    },
  });
};
