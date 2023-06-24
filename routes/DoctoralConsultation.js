const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const doctoralConsultationHandler = require('./handler/DoctoralConsultation');

router.post('/request/:uidPatient', middleware.DoctorAuthorization, doctoralConsultationHandler.AddDoctoralAndMedicine);
router.get('/detail/:uid', middleware.DoctorAuthorization, doctoralConsultationHandler.GetDoctoralConsultationDetail);
router.get('/:uidPatient', middleware.DoctorAuthorization, doctoralConsultationHandler.GetDoctoralConsultationList);
router.put('/update/:uid', middleware.SuperAuthorization, doctoralConsultationHandler.UpdateDoctoralConsultation);

module.exports = router;
