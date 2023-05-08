const { Logs } = require('../../models');

const LogsCreator = async (uidAdministrationAccount, uidPatient, action, status, message) => {
  const createLogs = await Logs.create({
    uidAdministrationAccount,
    uidPatient,
    action,
    status,
    message,
  });

  if (!createLogs) {
    return {
      status: 'error',
      message: 'Create logs failed!',
    };
  }

  return {
    status: 'success',
    message: 'Create logs success!',
  };
};

module.exports = LogsCreator;
