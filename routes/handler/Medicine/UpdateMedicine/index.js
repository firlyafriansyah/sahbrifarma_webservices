const Validator = require('fastest-validator');
const { Decryptor, LogsCreator } = require('../../../../utils');
const { sequelize, Medicine } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;

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
      const medicineTarget = await Medicine.findOne({
        where: { uidMedicine: uid },
      }, { transaction: t, lock: true });

      if (!medicineTarget) {
        throw new Error('This medicine target not found!');
      }

      const updateMedicine = await medicine.update({
        medicine,
        preparation,
        dosage,
        rules,
        status: medicine.status,
      });

      if (!updateMedicine) {
        throw new Error('Failed update this medicine terget!');
      }

      await LogsCreator(User, uid, 'Update Medicine', 'success', 'Successfully update this medicine target!');

      return res.json({
        status: 'success',
        data: medicine,
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
