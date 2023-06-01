const { Logs } = require('../../models');

const LogsCreator = async (uidExecutor, uidTarget, action, status, message) => {
  const data = {
    uidExecutor: uidExecutor ? uidExecutor.toString() : null,
    uidTarget: uidTarget ? uidTarget.toString() : null,
    action,
    status,
    message,
  };

  const createLogs = await Logs.create(data);

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
