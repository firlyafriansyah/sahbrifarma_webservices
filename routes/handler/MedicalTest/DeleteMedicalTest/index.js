const { MedicalTest, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const medicalTest = await MedicalTest.findOne({
        where: { uid },
      }, { transaction: t, lock: true });

      if (!medicalTest) {
        throw new Error('This medical test target not found!');
      }

      const deleteMedicalTest = await medicalTest.destroy({ transaction: t, lock: true });

      if (!deleteMedicalTest) {
        throw new Error('Faield delete this medical test target!');
      }

      await LogsCreator(User, uid, 'Delete Medical Test', 'success', 'Successfully deleted this medical test target!');

      return res.json({
        status: 'success',
        message: 'Successfully deleted this medical test target!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Delete Medical Test', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
