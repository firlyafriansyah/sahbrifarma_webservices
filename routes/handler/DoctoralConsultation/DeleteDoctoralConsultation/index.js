const { DoctoralConsultation, sequelize } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  try {
    return await sequelize.transaction(async (t) => {
      const docotoralConsultation = await DoctoralConsultation.findOne({
        where: { uidDoctoralConsultation: uid },
      }, { transaction: t, lock: true });

      if (!docotoralConsultation) {
        throw new Error('This doctoral consultation target not found!');
      }

      const deleteDoctoralConsultation = await docotoralConsultation.destroy({
        transaction: t, lock: true,
      });

      if (!deleteDoctoralConsultation) {
        throw new Error('Failed delete this doctoral consultation target!');
      }

      await LogsCreator(User, uid, 'Delete Doctoral Consultation', 'success', 'Successfully deleted this doctoral consultation target!');

      return res.json({
        status: 'success',
        message: 'Successgully deleted this doctoral consultation target!',
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Delete Doctoral Consultation', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
