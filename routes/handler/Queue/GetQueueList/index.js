const { Queue, AdministrationAccount, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  let status = null;
  let whereStatement = {};

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('This adminstration account executor not found!');
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
      }, { transaction: t, lock: true });

      if (!getQueueList || getQueueList.length <= 0) {
        throw new Error('This queue list target not found!');
      }

      await LogsCreator(User, null, 'Get Queue List', 'success', 'Successfully get queue list target!');

      return res.json({
        status: 'success',
        data: getQueueList,
      });
    });
  } catch (error) {
    await LogsCreator(User, null, 'Get Queue List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
