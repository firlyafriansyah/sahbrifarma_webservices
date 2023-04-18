const express = require('express');

const router = express.Router();

const servicesConnectionTestHandler = require('./handler/ServicesConnectionTest');

router.get('/', servicesConnectionTestHandler);

module.exports = router;
