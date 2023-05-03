const {
  PatientIdentity, Allergies, Anamnesis, Diagnosis, MedicalTest, Medicine, Logs, Queue,
} = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid },
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Deleted Patient Identity',
      status: 'error',
      message: `Patient with this id not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient with this id not found!',
    });
  }

  const allergies = await Allergies.findOne({
    where: { uidPatient: uid },
  });

  const anamnesis = await Anamnesis.findOne({
    where: { uidPatient: uid },
  });

  const diagnosis = await Diagnosis.findOne({
    where: { uidPatient: uid },
  });

  const medicalTest = await MedicalTest.findOne({
    where: { uidPatient: uid },
  });

  const medicine = await Medicine.findOne({
    where: { uidPatient: uid },
  });

  const queue = await Queue.findOne({
    where: { uidPatient: uid },
  });

  if (allergies) {
    await allergies.destroy();
  }

  if (anamnesis) {
    await anamnesis.destroy();
  }

  if (diagnosis) {
    await diagnosis.destroy();
  }

  if (medicalTest) {
    await medicalTest.destroy();
  }

  if (medicine) {
    await medicine.destroy();
  }

  if (queue) {
    await queue.destroy();
  }

  await patientIdentity.destroy();

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Deleted Patient Identity',
    status: 'success',
    message: `Patient identity successfully deleted! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Patient identity successfully deleted!',
  });
};
