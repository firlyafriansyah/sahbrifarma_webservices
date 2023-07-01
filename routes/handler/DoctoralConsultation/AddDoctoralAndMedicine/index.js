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
        throw new Error('Akun tidak ditemukan!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      const queue = await Queue.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!queue) {
        throw new Error('Pasien tidak dalam antrean!');
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
        throw new Error('Hasil konsultasi dan periksa kesehatan lanjutan gagal dibuat!');
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
          throw new Error('Permintaan obat gagal dibuat!');
        }

        const visitHistory = await VisitHistory.create({
          uidPatient,
          uidMedicalType: createDoctoralConsultation.uidDoctoralConsultation,
          visitDate: new Date(),
          uidMedicineRequest: createMedicineRequest.uidMedicine,
          medicalType: 'Konsultasi Dan Periksa Kesehatan Lanjutan',
        }, { transaction: t, lock: true });

        if (!visitHistory) {
          throw new Error('Riwayat kunjungan gagal dibuat!');
        }

        const updateQueue = queue.update({
          status: 'in_pharmacist_queue',
        });

        if (!updateQueue) {
          throw new Error('Update antrean pasien gagal!');
        }
      } else {
        const visitHistory = await VisitHistory.create({
          uidPatient,
          uidMedicalType: createDoctoralConsultation.uidDoctoralConsultation,
          visitDate: new Date(),
          uidMedicineRequest: null,
          medicalType: 'Konsultasi Dan Periksa Kesehatan Lanjutan',
        }, { transaction: t, lock: true });

        if (!visitHistory) {
          throw new Error('Riwayat kunjungan gagal dibuat!');
        }

        const updateQueue = queue.update({
          status: 'out_of_queue',
        });

        if (!updateQueue) {
          throw new Error('Update antrean pasien gagal!');
        }
      }

      await LogsCreator(User, uidPatient, 'Create Doctoral Consultation', 'success', 'Hasil konsultasi dan periksa kesehatan lanjutan berhasil dibuat!');

      return res.json({
        status: 'success',
        message: 'Hasil konsultasi dan periksa kesehatan lanjutan berhasil dibuat!',
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
