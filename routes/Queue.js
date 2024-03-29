const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const queueHandler = require('./handler/Queue');

router.get('/', middleware.Queue, queueHandler.GetQueueList);
router.get('/:uidPatient', middleware.FrontdeskAuthorization, queueHandler.CheckQueuePatient);
router.put('/update/:uid&:currentStatus&:newStatus', middleware.Queue, queueHandler.UpdateQueue);

module.exports = router;
