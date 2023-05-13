const { MedicalTest, Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const medicalTest = await MedicalTest.findOne({
        where: { uidMedicalTest: uid },
      }, { transaction: t, lock: true });

      if (!medicalTest) {
        throw new Error('This medical test target not found!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient: medicalTest.uidPatient },
        attributes: ['name', 'date_of_birth', 'sex'],
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Patient with this medical test target not found!');
      }

      await LogsCreator(User, uid, 'Get Medical Test Target', 'success', 'Successfully get medical test detail target!');

      return res.json({
        status: 'success',
        data: {
          patient,
          medicalTest,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Get Medical Test Target', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
