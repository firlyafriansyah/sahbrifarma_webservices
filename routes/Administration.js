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
router.put('/disabled/:uid', middleware.SuperAuthorization, administrationHandler.DisabledAdministrationAccount);
router.put('/actived/:uid', middleware.SuperAuthorization, administrationHandler.ActivatedAdministrationAccount);
router.delete('/delete/:uid', middleware.SuperAuthorization, administrationHandler.DeleteAdministrationAccount);

module.exports = router;
