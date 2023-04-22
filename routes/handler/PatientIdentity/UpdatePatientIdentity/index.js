const Validator = require('fastest-validator');
const {
  PatientIdentity, Logs,
} = require('../../../../models');
const { Decryptor } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    nama_lengkap: 'string|empty:false',
    alamat: 'string|empty:false',
    nomor_telepon: 'string|empty:false',
    nomor_telepon_darurat: 'string|empty:false',
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

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid },
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Patient Identity',
      status: 'error',
      message: `Patient with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient with this uid not found!',
    });
  }

  const patientIdentityData = {
    name: req.body.nama_lengkap,
    address: req.body.alamat,
    phoneNumber: req.body.nomor_telepon,
    emergencyPhoneNumber: req.body.nomor_telepon_darurat,
    dateOfBirth: req.body.tanggal_lahir,
    sex: req.body.jenis_kelamin,
  };

  if (
    req.body.nama_lengkap === patientIdentity.name
    && req.body.alamat === patientIdentity.address
    && req.body.nomor_telepon === patientIdentity.phoneNumber
    && req.body.nomor_telepon_darurat === patientIdentity.emergencyPhoneNumber
    && req.body.tanggal_lahir === patientIdentity.dateOfBirth
    && req.body.jenis_kelamin === patientIdentity.sex
  ) {
    return res.json({
      status: 'success',
      message: 'Administration account data same with existing data!',
    });
  }

  const updatePatientIdentity = await patientIdentity.update(patientIdentityData);

  if (!updatePatientIdentity) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Patient Identity',
      status: 'error',
      message: `Update patient identity failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Update patient identity failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Update Patient Identity',
    status: 'error',
    message: `Patient identity successfully updated! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: updatePatientIdentity,
  });
};
