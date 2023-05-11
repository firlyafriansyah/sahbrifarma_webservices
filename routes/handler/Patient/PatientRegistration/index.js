const Validator = require('fastest-validator');
const { Patient, Queue } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

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

  const patientData = {
    uidPatient: IDPasien,
    name: req.body.nama_lengkap,
    address: req.body.alamat,
    phoneNumber: req.body.nomor_telepon,
    emergencyPhoneNumber: req.body.nomor_telepon_darurat,
    dateOfBirth: req.body.tanggal_lahir,
    sex: req.body.jenis_kelamin,
  };

  const queueData = {
    uidPatient: IDPasien,
    patientName: req.body.nama_lengkap,
  };

  const patient = await Patient.create(patientData);
  const queue = await Queue.create(queueData);

  return Promise.all([
    patient, queue,
  ]).then(async () => {
    await LogsCreator(User, null, 'Register Patient', 'success', 'Successfully registered this patient target!');

    return res.json({
      status: 'success',
      message: 'Successfully register this patient target!',
    });
  }).catch(async () => {
    await LogsCreator(User, null, 'Register Patient', 'error', 'Failed register this patient target!');

    return res.status(409).json({
      status: 'error',
      message: 'Failed register this patient target!',
    });
  });
};
