const Validator = require('fastest-validator');
const {
  PatientIdentity, Allergies, Anamnesis, Diagnosis, MedicalTest, Medicine, Logs, Queue,
} = require('../../../../models');
const { Decryptor } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    nama_lengkap: 'string|empty:false',
    alamat: 'string|empty:false',
    nomor_telepon: 'string|optional',
    nomor_telepon_darurat: 'string|optional',
    tanggal_lahir: 'string|empty:false',
    jenis_kelamin: { type: 'enum', values: ['Laki - Laki', 'Perempuan'] },
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(403).json({
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

  const queueData = {
    uidPatient: IDPasien,
    patientName: req.body.nama_lengkap,
  };

  const patientIdentity = await PatientIdentity.create(patientIdentityData);
  const allergies = await Allergies.create(allergiesData);
  const anamnesis = await Anamnesis.create(anamnesisData);
  const diagnosis = await Diagnosis.create(diagnosisData);
  const medicalTest = await MedicalTest.create(medicalTestData);
  const medicine = await Medicine.create(medicineData);
  const queue = await Queue.create(queueData);

  return Promise.all([
    patientIdentity, allergies, anamnesis, diagnosis, medicalTest, medicine, queue,
  ]).then(async () => {
    await Logs.create({
      administrationAccount: User || 'Guest',
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
      administrationAccount: User || 'Guest',
      action: 'Register Patient Identity',
      status: 'error',
      message: `Patient identity registered failed! (target: ${req.body.nama_lengkap})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Patient identity registered failed!',
    });
  });
};
