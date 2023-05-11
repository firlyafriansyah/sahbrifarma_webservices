const { Queue, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid, currentStatus, newStatus } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const queue = await Queue.findOne({
        where: { uidPatient: uid },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('This patient target not found!');
      }

      if (queue.status !== currentStatus) {
        throw new Error('This patient target queue has wrong current status!');
      }

      const updateQueue = await queue.update({
        status: newStatus,
      }, { transaction: t, lock: true });

      if (!updateQueue) {
        throw new Error('Failed update this patient queue target!');
      }

      await LogsCreator(User, uid, 'Update Patient Queue', 'success', 'Successfully updated this patient queueu target!');

      return res.json({
        status: 'success',
        data: updateQueue,
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Patient Queue', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
