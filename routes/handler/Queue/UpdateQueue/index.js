const { Queue, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid, currentStatus, newStatus } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const queue = await Queue.findOne({
    where: { uidPatient: uid },
  });

  if (!queue) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: `Update Queue With Patient Uid: ${uid}`,
      status: 'error',
      message: `Patient with patient uid: ${uid} not found!`,
    });

    return res.status(404).json({
      status: 'error',
      message: `Patient with patient uid: ${uid} not found!`,
    });
  }

  if (queue.status !== currentStatus) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: `Update Queue With Patient Uid: ${uid}`,
      status: 'error',
      message: 'This current status for this account is wrong!',
    });

    return res.status(409).json({
      status: 'error',
      message: 'This current status for this account is wrong!',
    });
  }

  const updateQueue = await queue.update({
    status: newStatus,
  });

  if (!updateQueue) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Patient Queue Status',
      status: 'error',
      message: `Patient queue failed updated! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Patient queue failed updated!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Update Patient Queue Status',
    status: 'success',
    message: `Update patient queue status successfull! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: updateQueue,
  });
};
