const { Patient } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patientList = await Patient.findAll({
    attributes: ['uid', 'name', 'dateOfBirth', 'sex'],
  });

  if (!patientList || patientList.length <= 0) {
    await LogsCreator(User, null, 'Get Patient List', 'error', 'This patient list target not found!');

    return res.status(404).json({
      status: 'error',
      message: 'This patient list target not found!',
    });
  }

  await LogsCreator(User, null, 'Get Patient List', 'success', 'Successfully get this patient list target!');

  return res.json({
    status: 'success',
    data: patientList,
  });
};
