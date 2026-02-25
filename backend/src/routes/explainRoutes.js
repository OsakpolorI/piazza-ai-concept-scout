const express = require('express');
const router = express.Router();
const explainController = require('../controllers/explainController');

router.post('/', explainController.explainPost);

module.exports = router;
