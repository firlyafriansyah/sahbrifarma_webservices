const { Patient, Medicine, sequelize } = require('../../../../models');
const { LogsCreator, Decryptor } = require('../../../../utils');

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

      const medicineList = await Medicine.findAll({
        where: { uidPatient: patient.uidPatient },
      }, { transaction: t, lock: true });

      if (!medicineList || medicineList.length <= 0) {
        throw new Error('Medicine list with this patient target not found!');
      }

      await LogsCreator(User, uidPatient, 'Get Medicine List', 'success', 'Successfully get medicine list with this patient target!');

      return res.json({
        status: 'success',
        data: {
          patient,
          medicineList,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Get Medicine List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
