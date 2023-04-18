const express = require('express');

const router = express.Router();

const administrationHandler = require('./handler/Administration');

router.post('/register', administrationHandler.Register);
router.post('/login', administrationHandler.Login);
router.post('/autologin', administrationHandler.AutoLogin);
router.post('/logout/:uid', administrationHandler.Logout);
router.get('/', administrationHandler.GetAdministrationAccountList);
router.get('/detail/:uid', administrationHandler.GetAdministrationAccount);
router.put('/update/:uid', administrationHandler.UpdateAdministrationAccount);
router.delete('/delete/:uid', administrationHandler.DeleteAdministrationAccount);
router.put('/disabled/:uid', administrationHandler.DisabledAdministrationAccount);

module.exports = router;
