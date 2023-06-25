const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { Decryptor, LogsCreator } = require('../../../../utils');
const { AdministrationAccount, LoginStatus, sequelize } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6',
    role: { type: 'enum', values: ['frontdesk', 'nurse', 'doctor', 'pharmacist'] },
    fullname: 'string|empty:false',
    dateOfBirth: 'string|empty:false',
    sex: { type: 'enum', values: ['Laki - Laki', 'Perempuan'] },
  };

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(403).json({
      status: 'error',
      message: validate,
    });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const administrationAccount = await AdministrationAccount.findOne({
        where: { username: req.body.username },
      }, { transaction: t });

	console.log(req.body);

      if (administrationAccount) {
        throw new Error('This username already used by another administration account!');
      }

      const password = await bcrypt.hash(req.body.password, 10);

      const createAdministrationAccount = await AdministrationAccount.create({
        username: req.body.username,
        password,
        role: req.body.role,
        fullname: req.body.fullname,
        date_of_birth: req.body.dateOfBirth,
        sex: req.body.sex,
        status: 'active',
      }, { transaction: t });

      if (!createAdministrationAccount) {
        throw new Error('Failed registered this administration account!');
      }

      const createLoginStatus = await LoginStatus.create({
        uidAdministrationAccount: createAdministrationAccount.uidAdministrationAccount,
        loggedIn: false,
      }, { transaction: t });

      if (!createLoginStatus) {
        throw new Error('Failed create login status for this administration account!');
      }

      await LogsCreator(User, null, 'Register Administration Account', 'success', 'Successfully registered this administration account!');

      return res.json({
        status: 'success',
        data: {
          username: createAdministrationAccount.username,
	  fullname: createAdministrationAccount.fullname,
          role: createAdministrationAccount.role,
          loggedIn: createLoginStatus.loggedIn,
          status: createLoginStatus.status,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, null, 'Register Administration Account', 'error', error.message);

    return res.status(409).json({
      status: 'error',
      message: error.message,
    });
  }
};
