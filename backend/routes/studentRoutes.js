const express = require('express');
const router = express.Router();
const studentControler = require("../controllers/studentController.js")
const {verifyToken} = require('../middlewares/authMiddleware');

router.post("/details",verifyToken,studentControler.addDetails);

module.exports = router;