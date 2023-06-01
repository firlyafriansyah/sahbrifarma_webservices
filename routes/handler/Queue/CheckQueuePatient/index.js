const { Queue, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const { uidPatient } = req.params;

  try {
    return await sequelize.transaction(async (t) => {
      const checkQueue = await Queue.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (checkQueue.status !== 'out_of_queue') {
        throw new Error('This patient target on queue list!');
      }

      await LogsCreator(User, uidPatient, 'Check Queue', 'success', 'This patient target out of queue list!');

      return res.json({
        status: 'success',
        message: 'This patient target out of queue list!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Check Queue', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
