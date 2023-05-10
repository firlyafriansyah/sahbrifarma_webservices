const Validator = require('fastest-validator');
const { DoctoralConsultation, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, notes,
  } = req.body;

  const schema = {
    allergies: 'string|empty:false',
    anamnesis: 'string|empty:false',
    diagnosis: 'string|empty:false',
    notes: 'string|empty:false',
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
      const doctoralConsultation = await DoctoralConsultation.findOne({
        where: { uidDoctoralConsultation: uid },
      }, { transaction: t, lock: true });

      if (!doctoralConsultation) {
        throw new Error('This doctoral consultation target not found!');
      }

      const updateDoctoralConsultation = await doctoralConsultation.update({
        allergies,
        anamnesis,
        diagnosis,
        notes,
      }, { transaction: t, lock: true });

      if (!updateDoctoralConsultation) {
        throw new Error('Failed update this doctoral consultation target!');
      }

      await LogsCreator(User, uid, ' Update Doctoral Cosultation', 'success', 'Successfully updated this doctoral consultation target!');

      return res.json({
        status: 'success',
        data: updateDoctoralConsultation,
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, ' Update Doctoral Cosultation', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
