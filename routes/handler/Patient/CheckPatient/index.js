const { Patient } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patient = await Patient.findOne({
    where: { uidPatient },
  });

  if (!patient) {
    await LogsCreator(User, uidPatient, 'Check Patient', 'error', 'Pasien tidak ditemukan!');

    return res.status(404).json({
      status: 'error',
      message: 'Pasien tidak ditemukan!',
    });
  }

  await LogsCreator(User, uidPatient, 'Check Patient', 'success', 'Pasien ditemukan!');

  return res.json({
    status: 'success',
    message: 'Pasien ditemukan!',
  });
};
