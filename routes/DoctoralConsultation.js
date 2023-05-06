const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const doctoralConsultationHandler = require('./handler/DoctoralConsultation');

router.post('/:uidPatient', middleware.doctoralConsultationHandler, doctoralConsultationHandler.AddDoctoralConsultation);
router.get('/:uidPatient', middleware.doctoralConsultationHandler, doctoralConsultationHandler.GetDoctoralConsultationList);
router.get('/detail/:uid', middleware.doctoralConsultationHandler, doctoralConsultationHandler.GetDoctoralConsultationDetail);
router.put('/update/:uidPatient', middleware.SuperAuthorization, doctoralConsultationHandler.UpdateDoctoralConsultation);
router.delete('/delete/:uid', middleware.SuperAuthorization, doctoralConsultationHandler.DeleteDoctoralConsultation);

module.exports = router;
