const express = require('express');
const router = express.Router();
const teacherController = require("../controllers/teacherController")
const {verifyToken} = require('../middlewares/authMiddleware');

// get all teacher
router.get("/",teacherController.getAllTeachers);
router.post("/details",verifyToken,teacherController.addDetails);
router.get("/:id",teacherController.getDetails);
router.post("/subjects",verifyToken,teacherController.addSubjects);
router.get("/:teacher_id/subjects",teacherController.getSubjects);

module.exports = router;