const {
  MedicalTest, Patient, Medicine, sequelize,
} = require('../../../../models');
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
        attributes: ['created_at'],
      }, { transaction: t, lock: true });

      const medicineList = await Medicine.findAll({
        where: { uidPatient },
        attributes: ['created_at'],
      }, { transaction: t, lock: true });

      if (medicineList.length <= 0 && medicalTestList.length <= 0) {
        throw new Error('This medicine and medical test list target not found!');
      }

      await LogsCreator(User, uidPatient, 'Get Patient Visit History', 'success', 'Successfully get medical test list');

      return res.json({
        status: 'success',
        data: {
          medicalTestList,
          medicineList,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Get Patient Visit History', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
