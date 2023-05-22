const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const medicalTestHandler = require('./handler/MedicalTest');

router.post('/:uidPatient', middleware.NurseAuthorization, medicalTestHandler.AddMedicalTest);
router.get('/:uidPatient', medicalTestHandler.GetMedicalTestList);
router.get('/detail/:uid', middleware.NurseAuthorization, medicalTestHandler.GetMedicalTestDetail);
router.put('/update/:uid', middleware.SuperAuthorization, medicalTestHandler.UpdateMedicalTest);
router.delete('/delete/:uid', middleware.SuperAuthorization, medicalTestHandler.DeleteMedicalTest);

module.exports = router;
