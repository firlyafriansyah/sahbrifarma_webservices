const Validator = require('fastest-validator');
const { Decryptor, LogsCreator } = require('../../../../utils');
const { AdministrationAccount, sequelize, LoginStatus } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    fullname: 'string|empty:false',
    dateOfBirth: 'string|empty:false',
    sex: { type: 'enum', values: ['Laki - Laki', 'Perempuan'] },
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
        where: { uidAdministrationAccount: uid },
      }, { transaction: t, lock: true });

      if (!administrationAccount) {
        throw new Error('This administration account target not found!');
      }

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Can\'t change any information on administration account with role super admin!');
      }

      if (administrationAccount.fullname === req.body.fullname
          && administrationAccount.date_of_birth === req.body.dateOfBirth
          && administrationAccount.sex === req.body.sex
      ) {
        await LogsCreator(User, uid, 'Self Update Administration Account', 'success', 'You doesn\'t change anything!');

        return res.json({
          status: 'success',
          message: 'You doesn\'t change anything!',
        });
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      });

      if (!loginStatus) {
        throw new Error('This administration account target doesn\'t have login status!');
      }

      const updateAdministrationAccount = await administrationAccount.update({
        username: administrationAccount.username,
        password: administrationAccount.password,
        role: administrationAccount.role,
        fullname: req.body.fullname,
        date_of_birth: req.body.dateOfBirth,
        sex: req.body.sex,
        status: administrationAccount.status,
      }, { transaction: t, lock: true });

      if (!updateAdministrationAccount) {
        throw new Error('Failed updated this administration account target!');
      }

      const updateLoginStatus = await loginStatus.update({
        lastUpdate: administrationAccount.updatedAt,
        loggedIn: true,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Failed updated login status for this administration account target!');
      }

      await LogsCreator(User, uid, 'Self Update Administration Account', 'success', 'This administration account target successfully updated!');

      return res.json({
        status: 'success',
        updateAdministrationAccount,
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Self Update Administration Account', 'error', error.message);

    return res.json({
      status: 'success',
      message: error.message,
    });
  }
};
