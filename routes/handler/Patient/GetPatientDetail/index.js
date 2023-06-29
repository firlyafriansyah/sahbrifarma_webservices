const { Patient } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patient = await Patient.findOne({
    where: { uidPatient },
    attributes: ['uidPatient', 'name', 'address', 'phoneNumber', 'emergencyPhoneNumber', 'dateOfBirth', 'sex', ['updated_at', 'lastUpdated']],
  });

  if (!patient) {
    await LogsCreator(User, uidPatient, 'Get Patient Detail', 'error', 'Pasien tidak ditemukan!');

    return res.status(404).json({
      status: 'error',
      message: 'Pasien tidak ditemukan!',
    });
  }

  await LogsCreator(User, uidPatient, 'Get Patient Detail', 'success', 'Detail pasien berhasil di dapatkan!');

  return res.json({
    status: 'success',
    data: patient,
  });
};
