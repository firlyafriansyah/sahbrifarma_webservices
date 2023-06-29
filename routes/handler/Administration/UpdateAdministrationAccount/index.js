const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { Decryptor, LogsCreator } = require('../../../../utils');
const { AdministrationAccount, sequelize, LoginStatus } = require('../../../../models');

const v = new Validator();

module.exports = async (req, res) => {
  const { uid } = req.params;
  const { authorization } = req.headers;
  const { User } = Decryptor(authorization);

  const schema = {
    username: 'string|empty:false',
    role: { type: 'enum', values: ['frontdesk', 'nurse', 'doctor', 'pharmacist'] },
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
        throw new Error('Akun tidak ditemukan!');
      }

      if (administrationAccount.role === 'super-admin') {
        throw new Error('Akun dengan role Super Admin tidak bisa di perbaharui!');
      }

      const checkName = await AdministrationAccount.findOne({
        where: { username: req.body.username },
      }, { transaction: t, lock: true });

      if (checkName && checkName.username !== administrationAccount.username) {
        throw new Error('Username sudah digunakan oleh akun lain!');
      }

      let newPassword = administrationAccount.password;

      if (req.body.password) {
        newPassword = await bcrypt.hash(req.body.password, 10);
      }

      if (
        req.body.fullname === administrationAccount.fullname
        && req.body.sex === administrationAccount.sex
        && req.body.dateOfBirth === administrationAccount.date_of_birth
        && req.body.username === administrationAccount.username
        && req.body.role === administrationAccount.role
        && await bcrypt.compare(req.body.password, administrationAccount.password)
      ) {
        return res.json({
          status: 'success',
          message: 'Tidak ada perubahan apapun!',
        });
      }

      const loginStatus = await LoginStatus.findOne({
        where: { uidAdministrationAccount: administrationAccount.uidAdministrationAccount },
      });

      if (!loginStatus) {
        throw new Error('Akun tidak memilki status login!');
      }

      const updateAdministrationAccount = await administrationAccount.update({
        fullname: req.body.fullname,
        dateOfBirth: req.body.dateOfBirth,
        sex: req.body.sex,
        newPassword,
        username: req.body.username,
        role: req.body.role,
        status: administrationAccount.status,
      }, { transaction: t, lock: true });

      if (!updateAdministrationAccount) {
        throw new Error('Update akun gagal!');
      }

      const updateLoginStatus = await loginStatus.update({
        loggedIn: 0,
      }, { transaction: t, lock: true });

      if (!updateLoginStatus) {
        throw new Error('Update status login gagal!');
      }

      await LogsCreator(User, uid, 'Update Administration Account', 'success', 'Update akun berhasil!');

      return res.json({
        status: 'success',
        data: {
          username: updateAdministrationAccount.username,
          role: updateAdministrationAccount.role,
        },
      });
    });
  } catch (error) {
    await LogsCreator(User, uid, 'Update Administration Account', 'error', error.message);

    return res.json({
      status: 'success',
      message: error.message,
    });
  }
};
