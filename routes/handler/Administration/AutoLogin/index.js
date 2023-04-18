const { Decryptor } = require("../../../../utils");

module.exports = async (req, res) => {
  const { Authentication } = req.headers;
  const { Head, Tail } = Decryptor(Authentication)

  const administrationAccount = await AdministrationAccount.findOne({
    where: { username: Head },
  });

  if (!administrationAccount) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Auto Login',
      status: 'error',
      message: `Administration account not found! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Administration account not found!',
    });
  }

  const isValidPassword = await bcrypt.compare(Tail, administrationAccount.password);

  if (!isValidPassword) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Auto Login',
      status: 'error',
      message: `Password not match with this account! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'Password not match with this account!',
    });
  }

  if (administrationAccount.status === 'inactive') {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Auto Login',
      status: 'error',
      message: `This account on inactive status! (target: ${Head})`,
    });

    return res.status(403).json({
      status: 'error',
      message: 'This account on inactive status!',
    });
  }

  if (administrationAccount.loggedIn) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Auto Login',
      status: 'error',
      message: `This account already logged in on another device! (target: ${Head})`,
    });

    return res.status(404).json({
      status: 'error',
      message: 'This account already logged in on another device!',
    });
  }

  const updateLastUpdate = await administrationAccount.update({
    lastUpdate: administrationAccount.updatedAt,
  })

  if (!updateLastUpdate) {
    await Logs.create({
      administrationAccount: Decryptor(req.headers.authorization).Head,
      action: 'Auto Login',
      status: 'error',
      message: `Failed update last update on this account! (target: ${Head})`,
    });

    return res.status(409).json({
      status: 'error',
      message: 'Failed update last update on this account!!',
    });
  }

  await administrationAccount.update({
    loggedIn: true,
  });

  await Logs.create({
    administrationAccount: Decryptor(req.headers.authorization).Head,
    action: 'Auto Login',
    status: 'success',
    message: `Login success! (target: ${Head})`,
  });

  return res.json({
    status: 'success',
    data: {
      username: administrationAccount.username,
      role: administrationAccount.role,
    },
  });
}