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
    await LogsCreator(User, uidPatient, 'Check Patient', 'error', 'This patient target not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This patient target not found!',
    });
  }

  await LogsCreator(User, uidPatient, 'Check Patient', 'success', 'Successfully check this patient target!');

  return res.json({
    status: 'success',
    message: 'Successfully check this patient target!',
  });
};
