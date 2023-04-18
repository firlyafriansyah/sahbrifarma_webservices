const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const { Admin } = require('../../../../models');
const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    username: 'string|empty:false',
    password: 'string|min:6'
  }

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: 'error',
      message: validate
    });
  }

  const admin = await Admin.findOne({
    where: { username: req.body.username }
  });

  if (!admin) {
    return res.status(400).json({
      status: 'error',
      message: 'Username salah!'
    })
  }

  const isValidPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!isValidPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Password!'
    })
  }

  return res.json({
    status: 'success',
    data: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      last_update: admin.updatedAt,
    }
  })
}