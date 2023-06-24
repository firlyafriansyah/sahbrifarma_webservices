const { DoctoralConsultation, AdministrationAccount, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);
  const {
    allergies, anamnesis, diagnosis, medicalTreatment, notes,
  } = req.body;

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { uidAdministrationAccount: User },
      });

      if (!administrationAccount) {
        throw new Error('This administration account not found!');
      }

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
        medicalTreatment,
        notes,
        createdBy: administrationAccount.fullname,
      }, { transaction: t, lock: true });

      if (!updateDoctoralConsultation) {
        throw new Error('Failed update this doctoral consultation target!');
      }

      await LogsCreator(User, uid, ' Update Doctoral Cosultation', 'success', 'Successfully updated this doctoral consultation target!');

      return res.json({
        status: 'success',
        message: 'Successfully updated this doctoral consultation target!',
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
