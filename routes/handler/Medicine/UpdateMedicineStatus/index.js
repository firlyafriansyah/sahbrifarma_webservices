const { sequelize, Medicine } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid, currentStatus, newStatus } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const medicine = await Medicine.findOne({
        where: { uidMedicine: uid },
      }, { transaction: t, lock: true });

      if (!medicine) {
        throw new Error('Permintaan obat tidak ditemukan!');
      }

      if (medicine.status !== currentStatus) {
        throw new Error('Status permintaan obat salah!');
      }

      const updateMedicine = await medicine.update({
        status: newStatus,
      }, { transaction: t, lock: true });

      if (!updateMedicine) {
        throw new Error('Update status permintaan obat gagal!');
      }

      await LogsCreator(User, uid, 'Update Medicine Status', 'success', 'Update status permintaan obat berhasil!');

      return res.json({
        status: 'success',
        data: updateMedicine,
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Medicine Status', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
