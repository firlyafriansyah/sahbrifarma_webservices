const {
  sequelize, Medicine, Queue, Patient,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient: uid },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('This patient target not found!');
      }

      const medicine = await Medicine.findOne({
        where: { uidPatient: patient.uidPatient },
      }, { transaction: t, lock: true });

      if (!medicine) {
        throw new Error('Medicine for this patient target not found!');
      }

      const queue = await Queue.findOne({
        where: { uidPatient: patient.uidPatient },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('Queeu for this patient target not found!');
      }

      if (medicine.status !== 'requested') {
        throw new Error('This medicine target status has wrong status!');
      }

      const updateMedicine = await medicine.update({
        status: 'finished',
      }, { transaction: t, lock: true });

      if (!updateMedicine) {
        throw new Error('Failed update this medicine status target!');
      }

      const updateQueue = await queue.update({
        status: 'out_of_queue',
      }, { transaction: t, lock: true });

      if (!updateQueue) {
        throw new Error('Failed update queue for this patient target!');
      }

      await LogsCreator(User, uid, 'Finish Medicine Request', 'success', 'Successfully updated this medicine status target!');

      return res.json({
        status: 'success',
        message: 'Successfully updated this medicine status target!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Finish Medicine Request', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
