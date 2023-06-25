const Validator = require('fastest-validator');
const { Patient, Queue, sequelize, AdministrationAccount } = require('../../../../models');
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

  const administrationAccount = await AdministrationAccount.findOne({
    where: { uidAdministrationAccount: User },
  });

  if (!administrationAccount) {
    return res.status(404).json({
       status: 'error',
       message: 'Administartion account not found!'
    });
  }

  const patientData = {
    uidPatient: IDPasien,
    name: req.body.nama_lengkap,
    address: req.body.alamat,
    phoneNumber: req.body.nomor_telepon,
    emergencyPhoneNumber: req.body.nomor_telepon_darurat,
    dateOfBirth: req.body.tanggal_lahir,
    sex: req.body.jenis_kelamin,
    createdBy: administrationAccount.fullname,
  };

  const queueData = {
    uidPatient: IDPasien,
    patientName: req.body.nama_lengkap,
    sex: req.body.jenis_kelamin,
  };

  try {
    return await sequelize.transaction(async (t) => {
      const checkExistingPatient = await Patient.findOne({
        where: { name: req.body.nama_lengkap, dateOfBirth: req.body.tanggal_lahir },
      }, { transaction: t, lock: true });

      if (checkExistingPatient) {
        throw new Error('This patient target maybe already registered!');
      }

      const patient = await Patient.create(patientData, { transaction: t, lock: true });
      const queue = await Queue.create(queueData, { transaction: t, lock: true });

      return Promise.all([
        patient, queue,
      ]).then(async () => {
        await LogsCreator(User, null, 'Register Patient', 'success', 'Successfully registered this patient target!');

        return res.json({
          status: 'success',
          data: patient.uidPatient,
        });
      }).catch(async () => {
        throw new Error('Failed register this patient target!');
      });
    });
  } catch (error) {
    await LogsCreator(User, null, 'Register Patient', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
