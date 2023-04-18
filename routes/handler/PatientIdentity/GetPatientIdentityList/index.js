const { PatientIdentity, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const patientIdentityList = await PatientIdentity.findOne({
    where: { uid },
    attributes: ['uid', 'name', 'dateOfBirth', 'sex'],
  });

  if (!patientIdentityList) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
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
    administrationAccount: Decryptor(req.headers.authorization).Head,
    action: 'Get Patient Identity List',
    status: 'success',
    message: 'Get patient identity list success!',
  });

  return res.json({
    status: 'success',
    data: patientIdentityList,
  });
};
