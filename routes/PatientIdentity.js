const express = require('express');

const router = express.Router();

const patientIdentityHandler = require('./handler/PatientIdentity');

router.post('/register', patientIdentityHandler.PatientRegistration);
router.get('/', patientIdentityHandler.GetPatientIdentityList);
router.get('/detail/:uid', patientIdentityHandler.GetPatientIdentity);
router.put('/update/:uid', patientIdentityHandler.UpdatePatientIdentity);
router.delete('/delete/:uid', patientIdentityHandler.DeletePatientIdentity);

module.exports = router;
