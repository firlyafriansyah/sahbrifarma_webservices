const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const medicalTestHandler = require('./handler/MedicalTest');

router.get('/:uidPatient', middleware.NurseAuthorization, medicalTestHandler.GetMedicalTestList);
router.get('/detail/:uid', middleware.NurseAuthorization, medicalTestHandler.GetMedicalTestDetail);
router.post('/:uidPatient', middleware.NurseAuthorization, medicalTestHandler.AddMedicalTest);
router.put('/:uidPatient', middleware.SuperAuthorization, medicalTestHandler.AddMedicalTest);
router.delete('/:uid', middleware.SuperAuthorization, medicalTestHandler.AddMedicalTest);

module.exports = router;
