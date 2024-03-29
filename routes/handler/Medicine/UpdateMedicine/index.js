const { Decryptor, LogsCreator } = require('../../../../utils');
const { sequelize, Medicine } = require('../../../../models');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    medicine, preparation, dosage, rules,
  } = req.body;

  try {
    return await sequelize.transaction(async (t) => {
      const medicineTarget = await Medicine.findOne({
        where: { uidMedicine: uid },
      }, { transaction: t, lock: true });

      if (!medicineTarget) {
        throw new Error('Permintaan obat tidak ditemukan!');
      }

      const updateMedicine = await medicineTarget.update({
        medicine,
        preparation,
        dosage,
        rules,
        status: medicine.status,
      });

      if (!updateMedicine) {
        throw new Error('Update permintaan obat gagal dibuat!');
      }

      await LogsCreator(User, uid, 'Update Medicine', 'success', 'Update permintaan obat berhasil dibuat!');

      return res.json({
        status: 'success',
        updateMedicine,
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Medicine', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
