const { DoctoralConsultation, Patient, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const patient = await Patient.findOne({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!patient) {
        throw new Error('This patient target not found!');
      }

      const doctoralConsultationList = await DoctoralConsultation.findAll({
        where: { uidPatient },
      }, { transaction: t, lock: true });

      if (!doctoralConsultationList || doctoralConsultationList.length <= 0) {
        throw new Error('Doctoral consultation list for this patient target not found!');
      }

      await LogsCreator(User, uidPatient, 'Get Doctoral Consultation List', 'success', 'Successfully get doctoral consultation list for this patient target!');

      return res.json({
        status: 'success',
        data: {
          patient,
          doctoralConsultationList,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uidPatient, 'Get Doctoral Consultation List', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
