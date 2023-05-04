const { MedicalTest, Logs } = require('../../../../models');
const { Decryptor } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const medicalTest = await MedicalTest.findOne({
    where: { uid },
  });

  if (!medicalTest) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Medical Test',
      status: 'error',
      message: `Medical test with this uid not found! (target: ${uid})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Medical test with this uid not found!',
    });
  }

  const deleteMedicalTest = await medicalTest.destroy();

  if (!deleteMedicalTest) {
    await Logs.create({
      administrationAccount: User || 'Guest',
      action: 'Delete Medical Test',
      status: 'error',
      message: `Delete this medical test failed! (target: ${uid})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Delete this medical test failed',
    });
  }

  await Logs.create({
    administrationAccount: User || 'Guest',
    action: 'Delete Medical Test',
    status: 'error',
    message: `Delete this medical test success! (target: ${uid})`,
  });

  return res.json({
    status: 'success',
    message: 'Delete this medical test success!',
  });
};
