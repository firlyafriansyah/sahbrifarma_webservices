const { Queue, Logs, AdministrationAccount } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  let status = null;
  let whereStatement = {};

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: User },
    attributes: ['role'],
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: `Get Queue ${status} List`,
      status: 'error',
      message: 'This administration account not found!',
    });

    return res.status(404).json({
      status: 'error',
      message: 'This administration account not found!',
    });
  }

  if (administrationAccount.role === 'frontdesk') {
    status = 'out_of_queue';
  } else if (administrationAccount.role === 'nurse') {
    status = 'in_medical_test_queue';
  } else if (administrationAccount.role === 'doctor') {
    status = 'in_doctoral_consultation_queue';
  } else if (administrationAccount.role === 'pharmacist') {
    status = 'in_pharmacist_queue';
  }

  if (status) {
    whereStatement = { status };
  }

  const getQueueList = await Queue.findAll({
    where: whereStatement,
    attributes: ['uidPatient', 'patientName', 'status', ['updated_at', 'lastUpdate']],
  });

  if (!getQueueList) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: `Get Queue ${status} List`,
      status: 'error',
      message: `Queue ${status} list not found!`,
    });

    return res.status(404).json({
      status: 'error',
      message: `Queue ${status} list not found!`,
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: `Get Queue ${status} List`,
    status: 'success',
    message: `Get queue ${status} list success!`,
  });

  return res.json({
    status: 'success',
    data: getQueueList,
  });
};
