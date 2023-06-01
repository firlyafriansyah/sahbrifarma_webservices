const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const patientHandler = require('./handler/Patient');

router.post('/register', middleware.FrontdeskAuthorization, patientHandler.PatientRegistration);
router.get('/', middleware.FrontdeskAuthorization, patientHandler.GetPatientList);
router.get('/detail/:uidPatient', patientHandler.GetPatientDetail);
router.get('/visit-history/:uidPatient', middleware.FrontdeskAuthorization, patientHandler.GetPatientVisitHistory);
router.get('/check-patient/:uidPatient', middleware.FrontdeskAuthorization, patientHandler.CheckPatient);
router.put('/update/:uidPatient', middleware.FrontdeskAuthorization, patientHandler.UpdatePatient);
router.delete('/delete/:uidPatient', middleware.SuperAuthorization, patientHandler.DeletePatient);

module.exports = router;
