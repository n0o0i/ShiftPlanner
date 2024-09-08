const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

router.post('/calendar', controllers.api_contorller.index);
router.post('/sekouEvents', controllers.api_contorller.getSekouEvents);
router.post('/kintaiSubmit', controllers.api_contorller.kintaiSubmit);
router.post('/isSubmitted', controllers.api_contorller.isSubmitted);
router.post('/google_login', controllers.api_contorller.googleLogin);
router.post('/getSubmittedShift', controllers.api_contorller.getSubmittedShift);

module.exports = router;