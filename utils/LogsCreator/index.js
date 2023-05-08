const { Logs } = require('../../models');

const LogsCreator = async (uidExecutor, uidTarget, action, status, message) => {
  const createLogs = await Logs.create({
    uidExecutor: uidExecutor.toString(),
    uidTarget: uidTarget.toString(),
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
