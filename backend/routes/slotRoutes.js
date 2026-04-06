const express = require("express");
const router = express.Router();

const slotController = require("../controllers/slotController");
const { verifyToken } = require("../middlewares/authMiddleware");

// ➤ Create Slot
router.post("/", verifyToken, slotController.createSlot);

router.get("/", verifyToken,slotController.getMySlots);

// ➤ Get all slots of teacher
router.get("/teacher/:teacherId", slotController.getTeacherSlots);

// ➤ Get only available slots
router.get("/available/:teacherId", slotController.getAvailableSlots);

// ➤ Delete slot
router.delete("/:slotId", verifyToken, slotController.deleteSlot);

router.get("/booked",verifyToken,slotController.getBookedSlots);

module.exports = router;