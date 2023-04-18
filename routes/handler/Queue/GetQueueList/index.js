const { Queue, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { status } = req.params;

  const getQueueList = await Queue.findAll({
    where: { status },
    attributes: ['uidPatient', 'patientName', 'status', ['updatedAt', 'lastUpdate']],
  });

  if (!getQueueList) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
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
    administrationAccount: Decryptor(req.headers.authorization).Head,
    action: `Get Queue ${status} List`,
    status: 'success',
    message: `Get queue ${status} list success!`,
  });

  return res.json({
    status: 'success',
    data: getQueueList,
  });
};
