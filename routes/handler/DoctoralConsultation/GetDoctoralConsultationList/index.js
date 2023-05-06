const { DoctoralConsultation, PatientIdentity, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid: uidPatient },
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Doctoral Consultation List',
      status: 'error',
      message: `Patient with this patient uid not found! (target: ${uidPatient})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient with this patient uid not found!',
    });
  }

  const doctoralConsultationList = await DoctoralConsultation.findAll({
    where: { uidPatient },
  });

  if (!doctoralConsultationList || doctoralConsultationList.length <= 0) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Doctoral Consultation List',
      status: 'error',
      message: `Doctoral consultation list for this patient identity not found! (target: ${uidPatient})`,
    });

    return res.status.json({
      status: 'error',
      message: 'Doctoral consultation list for this patient identity not found!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Get Doctoral Consultation List',
    status: 'success',
    message: `Get Doctoral consultation list success! (target: ${uidPatient})`,
  });

  return res.json({
    status: 'success',
    doctoralConsultationList,
  });
};
