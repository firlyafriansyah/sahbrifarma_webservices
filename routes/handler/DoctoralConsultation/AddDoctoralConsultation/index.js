const {
  PatientIdentity, DoctoralConsultation, sequelize,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, notes,
  } = req.body;

  try {
    return await sequelize.transaction(async (t) => {
      const patientIdentity = await PatientIdentity.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patientIdentity) {
        throw new Error('This patient target not found');
      }

      const createDoctoralConsultation = await DoctoralConsultation.create({
        uidPatient,
        allergies,
        anamnesis,
        diagnosis,
        notes,
      }, { transaction: t, lock: true });

      if (!createDoctoralConsultation) {
        throw new Error('Failed create doctoral consultation for this patient target');
      }

      await LogsCreator(User, uidPatient, 'Create Doctoral Consultation', 'success', 'Seccussfully created doctoral consultation for this patient target!');

      return res.json({
        status: 'success',
        data: createDoctoralConsultation,
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Create Doctoral Consultation', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
