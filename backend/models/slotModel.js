const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// ➤ Create Slot (with overlap check)
function createSlot({ teacher_id, start_time, end_time }, callback) {
  const id = uuidv4();

  // 🔥 Check overlapping slots
  const checkQuery = `
    SELECT * FROM teacher_slots
    WHERE teacher_id = ?
    AND (
      (start_time < ? AND end_time > ?)
    )
  `;

  db.query(checkQuery, [teacher_id, end_time, start_time], (err, result) => {
    if (err) return callback(err, null);

    if (result.length > 0) {
      return callback({ message: "Slot overlaps with existing slot" }, null);
    }

    // ➤ Insert slot
    const insertQuery = `
      INSERT INTO teacher_slots
      (id, teacher_id, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [id, teacher_id, start_time, end_time], (err) => {
      if (err) return callback(err, null);

      // ✅ Better response
      callback(null, {
        slot_id: id,
        start_time,
        end_time,
      });
    });
  });
}


// ➤ Get All Slots of Teacher
function getTeacherSlots(teacher_id, callback) {
  const query = `
    SELECT id, start_time, end_time, status
    FROM teacher_slots
    WHERE teacher_id = ?
    ORDER BY start_time ASC
  `;

  db.query(query, [teacher_id], (err, result) => {
    if (err) return callback(err, null);

    callback(null, result);
  });
}


// ➤ Get Only Available Slots
function getAvailableSlots(teacher_id, callback) {
  const query = `
    SELECT id, start_time, end_time
    FROM teacher_slots
    WHERE teacher_id = ? AND status = 'free'
    ORDER BY start_time ASC
  `;

  db.query(query, [teacher_id], (err, result) => {
    if (err) return callback(err, null);

    callback(null, result);
  });
}


// ➤ Delete Slot (secured)
function deleteSlot(slot_id, teacher_id, callback) {
  const query = `
    DELETE FROM teacher_slots
    WHERE id = ? AND teacher_id = ?
  `;

  db.query(query, [slot_id, teacher_id], (err, result) => {
    if (err) return callback(err, null);

    if (result.affectedRows === 0) {
      return callback({ message: "Slot not found or unauthorized" }, null);
    }

    callback(null, result);
  });
}


module.exports = {
  createSlot,
  getTeacherSlots,
  getAvailableSlots,
  deleteSlot,
};