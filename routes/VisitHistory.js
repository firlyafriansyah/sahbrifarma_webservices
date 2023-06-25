const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const visitHistoryHandler = require('./handler/VisitHistory');

router.get('/:uidPatient', middleware.FrontdeskAuthorization, visitHistoryHandler.VisitHistory);

module.exports = router;
