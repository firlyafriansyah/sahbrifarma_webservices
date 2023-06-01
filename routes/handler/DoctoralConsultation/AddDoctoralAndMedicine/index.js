const Validator = require('fastest-validator');
const {
  Patient, DoctoralConsultation, Medicine, Queue, sequelize,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, notes, medicine, preparation, dosage, rules,
  } = req.body;

  const schema = {
    allergies: 'string|optional',
    anamnesis: 'string|empty:false',
    diagnosis: 'string|empty:false',
    notes: 'string|optional',
    medicine: 'string|empty:false',
    preparation: 'string|empty:false',
    dosage: 'string|empty:false',
    rules: 'string|empty:false',
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

      const queue = await Queue.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('Queue for this patient target not found');
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

      const createMedicineRequest = await Medicine.create({
        uidPatient,
        medicine,
        preparation,
        dosage,
        rules,
        status: 'requested',
      }, { transaction: t, lock: true });

      if (!createMedicineRequest) {
        throw new Error('Failed create medicine request for this patient target');
      }

      const updateQueue = queue.update({
        status: 'in_pharmacist_queue',
      });

      if (!updateQueue) {
        throw new Error('Failed udpate queue for this patient target!');
      }

      await LogsCreator(User, uidPatient, 'Create Doctoral Consultation', 'success', 'Seccussfully created doctoral consultation for this patient target!');

      return res.json({
        status: 'success',
        message: 'Seccussfully created doctoral consultation for this patient target!',
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
