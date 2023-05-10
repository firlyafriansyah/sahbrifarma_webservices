const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');
const { LogsCreator } = require('../../../../utils');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(409).json({
      status: 'error',
      message: validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { username: req.body.username },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('This administration account target not found!');
      }

      const isValidPassword = await bcrypt.compare(
        req.body.password,
        administrationAccount.password,
      );

      if (!isValidPassword) {
        throw new Error('Password not match with this administration account target!');
      }

      if (administrationAccount.status === 'inactive') {
        throw new Error('This administration account target status is inactive!');
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      }, { transaction: t, lock: true });

      if (!loginStatus) {
        throw new Error('This administration account target does\'t have login status!');
      }

      if (loginStatus.loggedIn) {
        throw new Error('This administration account target is already logged in on another device!');
      }

      const updateLoginStatus = await loginStatus.update({
        lastUpdate: administrationAccount.updatedAt,
        loggedIn: true,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Failed updated login status for this administration account target!');
      }

      await LogsCreator(null, administrationAccount.uidAdministrationAccount, 'Administration Account Login', 'success', 'This administration account target successfully logged in!');

      return res.json({
        status: 'success',
        data: {
          username: administrationAccount.username,
          role: administrationAccount.role,
        },
      });
    });
  } catch (error) {
    await LogsCreator(null, null, 'Administration Account Login', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
