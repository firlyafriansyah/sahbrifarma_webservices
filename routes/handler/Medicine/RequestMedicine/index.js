const Validator = require('fastest-validator');
const { Op } = require('sequelize');
const { sequelize, Patient, Medicine } = require('../../../../models');
const { LogsCreator, Decryptor } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uidPatient } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    medicine, preparation, dosage, rules,
  } = req.body;

  const schema = {
    medicine: 'string|empty:false',
    preparation: 'string|empty:false',
    dosage: 'string|empty:false',
    rules: 'string|empty:false',
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(403).json({
      status: 'error',
      message: validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Pasien tidak ditemukan!');
      }

      const checkMedicineRequest = await Medicine.findOne({
        where: { [Op.and]: [{ uidPatient }, { [Op.or]: [{ status: 'requested' }, { status: 'prepared' }] }] },
      });

      if (checkMedicineRequest) {
        throw new Error('Pasien masih memiliki permintaan obat!');
      }

      const requestedMedicine = await Medicine.create({
        uidPatient,
        medicine,
        preparation,
        dosage,
        rules,
        status: 'requested',
      }, { transaction: t, lock: true });

      if (!requestedMedicine) {
        throw new Error('Permintaan obat gagal dibuat!');
      }

      await LogsCreator(User, uidPatient, 'Create Medicine Request', 'success', 'Permintaan obat berhasil dibuat!');

      return res.json({
        status: 'success',
        data: requestedMedicine,
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Create Medicine Request', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
