const Validator = require('fastest-validator');
const {
  Patient, DoctoralConsultation, sequelize,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, notes,
  } = req.body;

  const schema = {
    allergies: 'string|optional',
    anamnesis: 'string|empty:false',
    diagnosis: 'string|empty:false',
    notes: 'string|optional',
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(401).json({
      status: 'error',
      validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
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
