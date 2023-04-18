const {
  PatientIdentity, Allergies, Anamnesis, Diagnosis, MedicalTest, Medicine, Logs,
} = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

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

  Promise.all([
    patientIdentity, allergies, anamnesis, diagnosis, medicalTest, medicine,
  ]).catch(async () => {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.administration_account),
      action: 'Deleted Patient Identity',
      status: 'error',
      message: `Patient with this uid not found! (target: ${uid})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Patient with this uid not found!',
    });
  });

  const patientIdentityDestroy = await PatientIdentity.destroy();
  const allergiesDestroy = await Allergies.destroy();
  const anamnesisDestroy = await Anamnesis.destroy();
  const diagnosisDestroy = await Diagnosis.destroy();
  const medicalTestDestroy = await MedicalTest.destroy();
  const medicineDestroy = await Medicine.destroy();

  return Promise.all([
    patientIdentityDestroy, allergiesDestroy, anamnesisDestroy,
    diagnosisDestroy, medicalTestDestroy, medicineDestroy,
  ]).then(async () => {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.administration_account),
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
      administrationAccount: Decryptor(req.headers.administration_account),
      action: 'Deleted Patient Identity',
      status: 'error',
      message: `Patient identity deleted failed! (target: ${uid})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Patient identity deleted failed!',
    });
  });
};
