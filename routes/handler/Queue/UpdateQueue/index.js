const { Queue, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient, newStatus } = req.params;

  const queue = await Queue.findOne({
    where: { uidPatient },
  });

  if (!queue) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: `Update Queue With Patient Uid: ${uidPatient}`,
      status: 'error',
      message: `Patient with patient uid: ${uidPatient} not found!`,
    });

    return res.status(404).json({
      status: 'error',
      message: `Patient with patient uid: ${uidPatient} not found!`,
    });
  }

  const updateQueue = await queue.update({
    status: newStatus,
  });

  if (!updateQueue) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
      action: 'Update Patient Queue Status',
      status: 'error',
      message: `Patient queue failed updated! (target: ${uidPatient})`,
    });

    return res.status(400).json({
      status: 'error',
      message: 'Patient queue failed updated!',
    });
  }

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head || 'Guest',
    action: 'Update Patient Queue Status',
    status: 'success',
    message: `Update patient queue status successfull! (target: ${uidPatient})`,
  });

  return res.json({
    status: 'success',
    data: updateQueue,
  });
};
