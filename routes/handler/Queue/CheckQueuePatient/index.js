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
        throw new Error('Pasien ini sedang dalam antrean!');
      }

      await LogsCreator(User, uidPatient, 'Check Queue', 'success', 'Pasien ini berada diluar antrean!');

      return res.json({
        status: 'success',
        message: 'TPasien ini berada diluar antrean!',
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
