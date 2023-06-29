const { Patient } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patientList = await Patient.findAll({
    attributes: ['uidPatient', 'name', 'dateOfBirth', 'sex'],
  });

  if (!patientList || patientList.length <= 0) {
    await LogsCreator(User, null, 'Get Patient List', 'error', 'Daftar pasien tidak ditemukan!');

    return res.status(404).json({
      status: 'error',
      message: 'Daftar pasien tidak ditemukan!',
    });
  }

  await LogsCreator(User, null, 'Get Patient List', 'success', 'Daftar pasien berhasil di dapatkan!');

  return res.json({
    status: 'success',
    data: patientList,
  });
};
