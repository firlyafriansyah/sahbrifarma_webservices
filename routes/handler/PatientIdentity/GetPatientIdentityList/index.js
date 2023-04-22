const { PatientIdentity, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const patientIdentityList = await PatientIdentity.findAll({
    attributes: ['uid', 'name', 'dateOfBirth', 'sex'],
  });

  if (!patientIdentityList) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Get Patient Identity List',
      status: 'error',
      message: 'Get patient identity list failed!',
    });

    return res.status(404).json({
      status: 'error',
      message: 'Get patient identity list failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Get Patient Identity List',
    status: 'success',
    message: 'Get patient identity list success!',
  });

  return res.json({
    status: 'success',
    data: patientIdentityList,
  });
};
