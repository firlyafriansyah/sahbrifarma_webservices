const express = require('express');

const router = express.Router();

const middleware = require('../middleware');
const queueHandler = require('./handler/Queue');

router.get('/:status', middleware.Queue, queueHandler.GetQueueList);
router.put('/update/:uid&:status', middleware.Queue, queueHandler.UpdateQueue);

module.exports = router;
