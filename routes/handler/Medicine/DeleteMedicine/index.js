const { sequelize, Medicine } = require('../../../../models');
const { LogsCreator, Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

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

      const destroyMedicine = await medicine.destroy({ transaction: t, lock: true });

      if (!destroyMedicine) {
        throw new Error('Failed delete this medicine target!');
      }

      await LogsCreator(User, uid, 'Delete Medicine', 'success', 'Successfully delete this medicine target!');

      return res.json({
        status: 'success',
        message: 'Successfully delete this medicine target!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Delete medicine', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
