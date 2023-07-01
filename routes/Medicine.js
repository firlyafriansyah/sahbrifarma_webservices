const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const medicineHandler = require('./handler/Medicine');

router.post('/request/:uidPatient', middleware.DoctorAuthorization, medicineHandler.RequestMedicine);
router.get('/:uidPatient', middleware.PharmacistAuthorization, medicineHandler.GetMedicineList);
router.get('/request/:uidPatient', middleware.PharmacistAuthorization, medicineHandler.GetMedicineRequest);
router.get('/detail/:uid', middleware.DoctorAuthorization, medicineHandler.GetMedicineDetail);
router.put('/update/:uid', middleware.DoctorAuthorization, medicineHandler.UpdateMedicine);
router.put('/update-status/:uid&:currentStatus&:newStatus', middleware.PharmacistAuthorization, medicineHandler.UpdateMedicineStatus);
router.put('/finish-request/:uid', middleware.PharmacistAuthorization, medicineHandler.FinishMedicineRequest);

module.exports = router;
