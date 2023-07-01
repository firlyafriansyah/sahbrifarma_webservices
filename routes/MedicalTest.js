const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const medicalTestHandler = require('./handler/MedicalTest');

router.post('/:uidPatient', middleware.NurseAuthorization, medicalTestHandler.AddMedicalTest);
router.get('/detail/:uid', medicalTestHandler.GetMedicalTestDetail);
router.get('/:uidPatient', medicalTestHandler.GetMedicalTestList);
router.put('/update/:uid', middleware.SuperAuthorization, medicalTestHandler.UpdateMedicalTest);

module.exports = router;
