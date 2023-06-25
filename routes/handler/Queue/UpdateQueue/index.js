const {
  Queue, sequelize, AdministrationAccount, VisitHistory,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid, currentStatus, newStatus } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('This administration account not found!');
      }

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

      if (administrationAccount.role === 'frontdesk') {
        const visitHistory = VisitHistory.create({
          uidPatient: uid,
          visitDate: new Date(),
          medicalType: newStatus === 'in_medical_test_queue' ? 'Medical Test' : 'Buy Medicine',
          status: 'on_pregress',
        }, { transaction: t, lock: true });

        if (!visitHistory) {
          throw new Error('Failed create visit history for this patient!');
        }
      }

      await LogsCreator(User, uid, 'Update Patient Queue', 'success', 'Successfully updated this patient queue target!');

      return res.json({
        status: 'success',
        message: 'Successfully updated this patient queue target!',
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
