const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const administrationHandler = require('./handler/Administration');

router.post('/login', administrationHandler.Login);
router.post('/autologin', administrationHandler.AutoLogin);
router.post('/register', middleware.SuperAuthorization, administrationHandler.Register);
router.post('/logout/:uid', middleware.Logout, administrationHandler.Logout);
router.get('/', middleware.SuperAuthorization, administrationHandler.GetAdministrationAccountList);
router.get('/detail/:uid', middleware.SuperAuthorization, administrationHandler.GetAdministrationAccount);
router.put('/update/:uid', middleware.SuperAuthorization, administrationHandler.UpdateAdministrationAccount);
router.delete('/delete/:uid', middleware.SuperAuthorization, administrationHandler.DeleteAdministrationAccount);
router.put('/disabled/:uid', middleware.SuperAuthorization, administrationHandler.DisabledAdministrationAccount);

module.exports = router;
