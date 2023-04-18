const { PatientIdentity, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const patientIdentity = await PatientIdentity.findOne({
    where: { uid },
    attributes: ['uid', 'name', 'address', 'phoneNumber', 'emergencyPhoneNumber', 'dateOfBirth', 'sex', ['updatedAt', 'lastUpdated']],
  });

  if (!patientIdentity) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.administration_account),
      action: 'Get Patient Identity',
      status: 'error',
      message: `Patient with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Patient with this uid not found!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.administration_account),
    action: 'Get Patient Identity',
    status: 'success',
    message: `Get patient with this uid success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: patientIdentity,
  });
};
