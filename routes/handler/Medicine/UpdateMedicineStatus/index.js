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
        throw new Error('This medicine target not found!');
      }

      if (medicine.status !== currentStatus) {
        throw new Error('This medicine target status has wrong status!');
      }

      const updateMedicine = await medicine.update({
        status: newStatus,
      }, { transaction: t, lock: true });

      if (!updateMedicine) {
        throw new Error('Failed update this medicine status target!');
      }

      await LogsCreator(User, uid, 'Update Medicine Status', 'success', 'Successfully updated this medicine status target!');

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
