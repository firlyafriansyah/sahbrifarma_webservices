const Validator = require('fastest-validator');
const {
  Patient, MedicalTest, Queue, AdministrationAccount, VisitHistory, sequelize,
} = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    bodyHeight, bodyWeight, bodyTemperature, bloodPressure, bloodSugar, uricAcid, cholesterol,
  } = req.body;

  const schema = {
    bodyHeight: 'number|optional',
    bodyWeight: 'number|optional',
    bodyTemperature: 'number|optional',
    bloodPressure: 'string|optional',
    bloodSugar: 'number|optional',
    uricAcid: 'number|optional',
    cholesterol: 'number|optional',
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

      const createMedicalTest = await MedicalTest.create({
        uidPatient,
        bodyHeight,
        bodyWeight,
        bodyTemperature,
        bloodPressure,
        bloodSugar,
        uricAcid,
        cholesterol,
        createdBy: administrationAccount.fullname,
      }, { transaction: t, lock: true });

      if (!createMedicalTest) {
        throw new Error('Hasil periksa kesehatan gagal dibuat!');
      }

      const visitHistory = await VisitHistory.create({
        where: {
          uidPatient,
          uidMedicalType: createMedicalTest.uidMedicalTest,
          visitDate: new Date(),
          medicalType: 'Periksa Kesehatan',
        },
      }, { transaction: t, lock: true });

      if (!visitHistory) {
        throw new Error('Riwayat kunjungan gagal dibuat!');
      }

      const updateQueue = queue.update({
        status: 'in_doctoral_consultation_queue',
      });

      if (!updateQueue) {
        throw new Error('Update antrean pasien gagal!');
      }

      await LogsCreator(User, uidPatient, 'Create Medical Test', 'success', 'Hasil periksa kesehatan berhasil dibuat!');

      return res.json({
        status: 'success',
        message: 'Hasil periksa kesehatan berhasil dibuat!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Create Medical Test', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
