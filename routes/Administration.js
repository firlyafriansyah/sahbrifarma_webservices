const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const administrationHandler = require('./handler/Administration');

router.post('/login', administrationHandler.Login);
router.post('/autologin', administrationHandler.AutoLogin);
router.post('/register', middleware.SuperAuthorization, administrationHandler.Register);
router.post('/logout/:uid', middleware.SelfAuthorization, administrationHandler.Logout);
router.get('/', middleware.SuperAuthorization, administrationHandler.GetAdministrationAccountList);
router.get('/detail/:uid', middleware.SelfAuthorization, administrationHandler.GetAdministrationAccount);
router.put('/update/:uid', middleware.SuperAuthorization, administrationHandler.UpdateAdministrationAccount);
router.put('/self-update/:uid', middleware.SelfAuthorization, administrationHandler.SelfUpdateAdministrationAccount);
router.put('/disabled/:uid', middleware.SuperAuthorization, administrationHandler.DisabledAdministrationAccount);
router.put('/activated/:uid', middleware.SuperAuthorization, administrationHandler.ActivatedAdministrationAccount);
router.delete('/delete/:uid', middleware.SuperAuthorization, administrationHandler.DeleteAdministrationAccount);

module.exports = router;
