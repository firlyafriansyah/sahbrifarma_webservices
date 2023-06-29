const Validator = require('fastest-validator');
const { Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

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
    return res.status(409).json({
      status: 'error',
      message: validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      const patientData = {
        name: req.body.nama_lengkap,
        address: req.body.alamat,
        phoneNumber: req.body.nomor_telepon,
        emergencyPhoneNumber: req.body.nomor_telepon_darurat,
        dateOfBirth: req.body.tanggal_lahir,
        sex: req.body.jenis_kelamin,
      };

      if (
        req.body.nama_lengkap === patient.name
        && req.body.alamat === patient.address
        && req.body.nomor_telepon === patient.phoneNumber
        && req.body.nomor_telepon_darurat === patient.emergencyPhoneNumber
        && req.body.tanggal_lahir === patient.dateOfBirth
        && req.body.jenis_kelamin === patient.sex
      ) {
        return res.json({
          status: 'success',
          message: 'Tidak ada perubahan apapun!',
        });
      }

      const updatePatient = await patient.update(patientData, { transaction: t, lock: true });

      if (!updatePatient) {
        throw new Error('Update pasien gagal!');
      }

      await LogsCreator(User, uidPatient, 'Update Patient', 'success', 'Update pasien berhasil!');

      return res.json({
        status: 'success',
        data: updatePatient,
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Update Patient', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
