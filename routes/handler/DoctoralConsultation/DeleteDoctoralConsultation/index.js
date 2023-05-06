const { DocotoralConsultation, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const docotoralConsultation = await DocotoralConsultation.findOne({
    where: { uid },
  });

  if (!docotoralConsultation) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Doctoral Consultation',
      status: 'error',
      message: `Doctoral consultation with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Doctoral consultation with this uid not found!',
    });
  }

  const deleteDoctoralConsultation = await docotoralConsultation.destroy();

  if (!deleteDoctoralConsultation) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Doctoral Consultation',
      status: 'error',
      message: `Delete this doctoral consultation failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Delete this doctoral consultation failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Delete Doctoral Consultation',
    status: 'error',
    message: `Delete this doctoral consultation success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Delete this doctoral consultation success!',
  });
};
