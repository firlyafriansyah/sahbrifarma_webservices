const express = require('express');

const router = express.Router();

const visitHistoryHandler = require('./handler/VisitHistory');

router.get('/:uidPatient', visitHistoryHandler.VisitHistory);
router.get('/date/:uidPatient', visitHistoryHandler.VisitHistoryDate);

module.exports = router;
