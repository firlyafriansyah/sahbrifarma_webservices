const { MedicalTest, Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('This patient target not found!');
      }

      const medicalTestList = await MedicalTest.findAll({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!medicalTestList || medicalTestList.length <= 0) {
        throw new Error('This medical test list target not found!');
      }

      await LogsCreator(User, uidPatient, 'Get Medical Test List', 'success', 'Successfully get medical test list');

      return res.json({
        status: 'success',
        data: {
          patient,
          medicalTestList,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Get Medical Test List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
