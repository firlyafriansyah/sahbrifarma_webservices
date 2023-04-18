const Validator = require('fastest-validator');
const {
  PatientIdentity, Allergies, Anamnesis, Diagnosis, MedicalTest, Medicine, Logs,
} = require('../../../../models');
const { Decryptor } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    nama_lengkap: 'string|empty:false',
    alamat: 'string|empty:false',
    nomor_telepon: 'string|optional',
    nomor_telepon_darurat: 'string|optional',
    tanggal_lahir: 'string|empty:false',
    jenis_kelamin: 'string|enum["Laki - Laki", "Perempuan"]',
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: 'error',
      message: validate,
    });
  }

  const DATE = new Date();
  const IDPasien = `${DATE.getFullYear()}${DATE.getMonth()}${DATE.getDate()}${DATE.getHours()}${DATE.getMinutes()}${DATE.getSeconds()}`;

  const patientIdentityData = {
    uid: IDPasien,
    name: req.body.nama_lengkap,
    address: req.body.alamat,
    phoneNumber: req.body.nomor_telepon,
    emergencyPhoneNumber: req.body.nomor_telepon_darurat,
    dateOfBirth: req.body.tanggal_lahir,
    sex: req.body.jenis_kelamin,
  };

  const allergiesData = {
    uidPatient: IDPasien,
  };

  const anamnesisData = {
    uidPatient: IDPasien,
  };

  const diagnosisData = {
    uidPatient: IDPasien,
  };

  const medicalTestData = {
    uidPatient: IDPasien,
  };

  const medicineData = {
    uidPatient: IDPasien,
  };

  const patientIdentity = await PatientIdentity.create(patientIdentityData);
  const allergies = await Allergies.create(allergiesData);
  const anamnesis = await Anamnesis.create(anamnesisData);
  const diagnosis = await Diagnosis.create(diagnosisData);
  const medicalTest = await MedicalTest.create(medicalTestData);
  const medicine = await Medicine.create(medicineData);

  return Promise.all([
    patientIdentity, allergies, anamnesis, diagnosis, medicalTest, medicine,
  ]).then(async () => {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Register Patient Identity',
      status: 'success',
      message: `Patient identity succesfully registered! (target: ${req.body.nama_lengkap})`,
    });

    return res.json({
      status: 'success',
      message: 'Patient identity succesfully registered!',
    });
  }).catch(async () => {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Register Patient Identity',
      status: 'error',
      message: `Patient identity registered failed! (target: ${req.body.nama_lengkap})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Patient identity registered failed!',
    });
  });
};
