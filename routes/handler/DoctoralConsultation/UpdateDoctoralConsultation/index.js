const Validator = require('fastest-validator');
const { DoctoralConsultation, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

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

  const doctoralConsultation = await DoctoralConsultation.findOne({
    where: { uid },
  });

  if (!doctoralConsultation) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Doctoral Consultation',
      status: 'error',
      message: `Doctoral consultation with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Doctoral consultation with this uid not found!',
    });
  }

  const updateDoctoralConsultation = await doctoralConsultation.update({
    allergies,
    anamnesis,
    diagnosis,
    notes,
  });

  if (!updateDoctoralConsultation) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Update Doctoral Consultation',
      status: 'error',
      message: `Update doctoral consultation failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Update doctoral consultation failed!',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Update Doctoral Consultation',
    status: 'error',
    message: `Update doctoral consultation success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    data: updateDoctoralConsultation,
  });
};
