const Validator = require('fastest-validator');
const {
  PatientIdentity, Logs,
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

  const { uid } = req.params;

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid },
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.administration_account),
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

  const updatePatientIdentity = await patientIdentity.update(patientIdentityData);

  if (!updatePatientIdentity) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.administration_account),
      action: 'Update Patient Identity',
      status: 'error',
      message: `Update patient identity failed! (target: ${uid})`,
    });

    return res.status(401).json({
      status: 'error',
      message: 'Update patient identity failed!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.administration_account),
    action: 'Update Patient Identity',
    status: 'error',
    message: `Patient identity successfully updated! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: updatePatientIdentity,
  });
};
