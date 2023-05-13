const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const medicineHandler = require('./handler/Medicine');

router.post('/request/:uidPatient', middleware.DoctorAuthorization, medicineHandler.RequestMedicine);
router.get('/:uidPatient', middleware.PharmacistAuthorization, medicineHandler.GetMedicineList);
router.get('/detail/:uid', middleware.PharmacistAuthorization, medicineHandler.GetMedicineDetail);
router.put('/update/:uid', middleware.DoctorAuthorization, medicineHandler.UpdateMedicine);
router.put('/update-status/:uid&:currentStatus&:newStatus', middleware.PharmacistAuthorization, medicineHandler.UpdateMedicineStatus);
router.delete('/delete/:uid', middleware.SuperAuthorization, medicineHandler.DeleteMedicine);

module.exports = router;
