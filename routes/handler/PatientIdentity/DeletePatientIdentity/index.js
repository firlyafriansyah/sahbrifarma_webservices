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

  Promise.all([
    patientIdentity, allergies, anamnesis, diagnosis, medicalTest, medicine, queue,
  ]).catch(async () => {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Deleted Patient Identity',
      status: 'error',
      message: `Patient with this uid not found! (target: ${uid})`,
    });

    return res.status(403).json({
      status: 'error',
      message: 'Patient with this uid not found!',
    });
  });

  const patientIdentityDestroy = await patientIdentity.destroy();
  const allergiesDestroy = await allergies.destroy();
  const anamnesisDestroy = await anamnesis.destroy();
  const diagnosisDestroy = await diagnosis.destroy();
  const medicalTestDestroy = await medicalTest.destroy();
  const medicineDestroy = await medicine.destroy();
  const queueDestroy = await queue.destroy();

  return Promise.all([
    patientIdentityDestroy, allergiesDestroy, anamnesisDestroy,
    diagnosisDestroy, medicalTestDestroy, medicineDestroy, queueDestroy,
  ]).then(async () => {
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
  }).catch(async () => {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Deleted Patient Identity',
      status: 'error',
      message: `Patient identity deleted failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Patient identity deleted failed!',
    });
  });
};
