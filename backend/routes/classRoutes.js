const express = require("express");
const router = express.Router();

const classController = require("../controllers/classController");
const { verifyToken } = require("../middlewares/authMiddleware");

// ➤ Request Class (student)
router.post("/", verifyToken, classController.requestClass);

// ➤ Teacher dashboard
router.get("/teacher", verifyToken, classController.getTeacherClasses);

// ➤ Student classes
router.get("/student", verifyToken, classController.getStudentClasses);

// ➤ Accept
router.put("/:classId/accept", verifyToken, classController.acceptClass);

// ➤ Reject
router.put("/:classId/reject", verifyToken, classController.rejectClass);

router.get("/pending",verifyToken,classController.getPendingClasses);

router.get("/active",verifyToken,classController.getActiveClasses);
// ➤ Get class details
router.get("/:classId", verifyToken, classController.getClassDetails);



module.exports = router;