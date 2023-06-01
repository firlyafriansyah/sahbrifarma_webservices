const { DoctoralConsultation, Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const doctoralConsultation = await DoctoralConsultation.findOne({
        where: { uidDoctoralConsultation: uid },
      }, { transaction: t, lock: true });

      if (!doctoralConsultation) {
        throw new Error('This doctoral consultation target not found!');
      }

      const patient = await Patient.findOne({
        where: { uidPatient: doctoralConsultation.uidPatient },
        attributes: ['name', 'date_of_birth', 'sex'],
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('Patient with this doctoral consultation target not found!');
      }

      await LogsCreator(User, uid, 'Get Doctoral Consultation Detail', 'success', 'Successfully get doctoral consultation target!');

      return res.json({
        status: 'success',
        data: {
          patient,
          doctoralConsultation,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Get Doctoral Consultation Detail', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
