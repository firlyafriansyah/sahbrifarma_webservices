const { VisitHistory } = require('../../../../models');
const { Decryptor, LogsCreator } = require('../../../../utils');

module.exports = async (req, res) => {
  const { uidPatient } = req.params;

  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const visitHistory = await VisitHistory.findAll({
    where: { uidPatient },
  });

  if (!visitHistory) {
    await LogsCreator(User, uidPatient, 'Get Visit History', 'error', 'Visit History for this patient target not found!');

    return res.status(404).json({
      status: 'error',
      message: 'Visit History for this patient target not found!',
    });
  }

  await LogsCreator(User, uidPatient, 'Get Patient Detail', 'success', 'Successfully get visit history for this patient target!');

  return res.json({
    status: 'success',
    data: visitHistory,
  });
};
