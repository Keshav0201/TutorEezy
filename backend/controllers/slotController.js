const slotModel = require("../models/slotModel");

// ➤ Create Slot
async function createSlot(req, res) {
  const teacher_id = req.user.id;
  const { day_of_week, start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({
      error: "Start time and end time required",
    });
  }

  if (start_time > end_time) {
    return res.status(400).json({
      error: "Invalid time",
    });
  }


  slotModel.createSlot({ teacher_id, day_of_week, start_time, end_time }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    res.json({
      success: true,
      message: "Slot created",
    });
  });
}

// ➤ Get all slots
async function getTeacherSlots(req, res) {
  const { teacherId } = req.params;

  slotModel.getTeacherSlots(teacherId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    res.json({
      success: true,
      slots: result,
    });
  });
}

// ➤ Get available slots
async function getAvailableSlots(req, res) {
  const { teacherId } = req.params;

  slotModel.getAvailableSlots(teacherId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    res.json({
      success: true,
      slots: result,
    });
  });
}

// ➤ Delete slot
async function deleteSlot(req, res) {
  const { slotId } = req.params;
  const teacher_id = req.user.id;

  slotModel.deleteSlot(slotId, teacher_id, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    res.json({
      success: true,
      message: "Slot deleted",
    });
  });
}

async function getBookedSlots(req,res) {
  const user_id = req.user.id;
  slotModel.getBookedSlots(user_id, (err,result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    res.json({
      success: true,
      slots: result
    });

  })
}

async function getMySlots(req, res) {
  const userId = req.user.id; // from auth middleware

  slotModel.getMySlots(userId, (err, slots) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message || err
      });
    }

    res.json({
      success: true,
      slots
    });
  });
}

module.exports = {
  createSlot,
  getTeacherSlots,
  getAvailableSlots,
  deleteSlot,
  getBookedSlots,
  getMySlots
};