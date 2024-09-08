const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

router.get('/', controllers.api_contorller.index);

module.exports = router;