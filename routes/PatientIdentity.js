const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const patientIdentityHandler = require('./handler/PatientIdentity');

router.post('/register', middleware.FrontdeskAuthorization, patientIdentityHandler.PatientRegistration);
router.get('/', middleware.FrontdeskAuthorization, patientIdentityHandler.GetPatientIdentityList);
router.get('/detail/:uid', middleware.FrontdeskAuthorization, patientIdentityHandler.GetPatientIdentity);
router.put('/update/:uid', middleware.FrontdeskAuthorization, patientIdentityHandler.UpdatePatientIdentity);
router.delete('/delete/:uid', middleware.SuperAuthorization, patientIdentityHandler.DeletePatientIdentity);

module.exports = router;
