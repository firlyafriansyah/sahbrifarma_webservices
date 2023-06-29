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
        throw new Error('Akun eksekutor tidak ditemukan!');
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
        attributes: ['uidPatient', 'patientName', 'status', 'sex', ['updated_at', 'lastUpdate']],
        order: [['updated_at', 'ASC']],
      }, { transaction: t, lock: true });

      if (!getQueueList || getQueueList.length <= 0) {
        throw new Error('Daftar antrean tidak ditemukan!');
      }

      await LogsCreator(User, null, 'Get Queue List', 'success', 'Daftar antrean berhasil di dapatkan!');

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
