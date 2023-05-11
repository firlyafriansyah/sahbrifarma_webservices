const { Patient } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patient = await Patient.findOne({
    where: { uidPatient },
    attributes: ['uid', 'name', 'address', 'phoneNumber', 'emergencyPhoneNumber', 'dateOfBirth', 'sex', ['updated_at', 'lastUpdated']],
  });

  if (!patient) {
    await LogsCreator(User, uidPatient, 'Get Patient Detail', 'error', 'This patient target not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This patient target not found!',
    });
  }

  await LogsCreator(User, uidPatient, 'Get Patient Detail', 'success', 'Successfully get this patient detail target!');

  return res.json({
    status: 'success',
    data: patient,
  });
};
