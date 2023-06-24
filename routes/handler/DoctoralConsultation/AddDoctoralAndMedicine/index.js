const Validator = require('fastest-validator');
const {
  Patient, DoctoralConsultation, Medicine, Queue, AdministrationAccount, VisitHistory, sequelize,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, medicalTreatment, notes, medicine, preparation, dosage, rules,
  } = req.body;

  const schema = {
    allergies: 'string|optional',
    anamnesis: 'string|empty:false',
    diagnosis: 'string|empty:false',
    medicalTreatment: 'string|empty:false',
    notes: 'string|optional',
    medicine: 'string|optional',
    preparation: 'string|optional',
    dosage: 'string|optional',
    rules: 'string|optional',
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
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      });

      if (!administrationAccount) {
        throw new Error('This administration account not found!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('This patient target not found!');
      }

      const queue = await Queue.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('Queue for this patient target not found!');
      }

      const createDoctoralConsultation = await DoctoralConsultation.create({
        uidPatient,
        allergies,
        anamnesis,
        diagnosis,
        medicalTreatment,
        notes,
        createdBy: administrationAccount.fullname,
      }, { transaction: t, lock: true });

      if (!createDoctoralConsultation) {
        throw new Error('Failed create doctoral consultation for this patient target!');
      }

      if (medicine || preparation || dosage || rules) {
        const createMedicineRequest = await Medicine.create({
          uidPatient,
          medicine,
          preparation,
          dosage,
          rules,
          status: 'requested',
          requestedBy: administrationAccount.fullname,
        }, { transaction: t, lock: true });

        if (!createMedicineRequest) {
          throw new Error('Failed create medicine request for this patient target!');
        }

        const visitHistory = await VisitHistory.findOne({
          where: { uidPatient },
        }, { transaction: t, lock: true });

        if (!visitHistory) {
          throw new Error('Visit history for this patient target not found!');
        }

        const updateVisitHistory = await visitHistory.update({
          medicalType: 'Pemeriksaan Kesehatan, Beli Obat',
        }, { transaction: t, lock: true });

        if (!updateVisitHistory) {
          throw new Error('Updated visit history for this patient target failed!');
        }

        const updateQueue = queue.update({
          status: 'in_pharmacist_queue',
        });

        if (!updateQueue) {
          throw new Error('Failed udpate queue for this patient target!');
        }
      } else {
        const updateQueue = queue.update({
          status: 'out_of_queue',
        });

        if (!updateQueue) {
          throw new Error('Failed update queue for this patient target!');
        }
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
