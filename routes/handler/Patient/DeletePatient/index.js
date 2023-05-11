const {
  Patient, Allergies, Anamnesis, Diagnosis, MedicalTest, Medicine, Queue, sequelize,
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

      const allergies = await Allergies.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      const anamnesis = await Anamnesis.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      const diagnosis = await Diagnosis.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      const medicalTest = await MedicalTest.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      const medicine = await Medicine.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      const queue = await Queue.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (allergies) {
        await Allergies.destroy({
          where: { uidPatient },
        }, { transaction: t, lock: true });
      }

      if (anamnesis) {
        await Anamnesis.destroy({
          where: { uidPatient },
        }, { transaction: t, lock: true });
      }

      if (diagnosis) {
        await Diagnosis.destroy({
          where: { uidPatient },
        }, { transaction: t, lock: true });
      }

      if (medicalTest) {
        await MedicalTest.destroy({
          where: { uidPatient },
        }, { transaction: t, lock: true });
      }

      if (medicine) {
        await Medicine.destroy({
          where: { uidPatient },
        }, { transaction: t, lock: true });
      }

      if (queue) {
        await Queue.destroy({
          where: { uidPatient },
        }, { transaction: t, lock: true });
      }

      await patient.destroy({ transaction: t, lock: true });

      await LogsCreator(User, uidPatient, 'Delete Patient', 'success', 'Successfully deleted this patient target!');

      return res.json({
        status: 'success',
        message: 'Successfully deleted this patient target!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Delete Patient', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
