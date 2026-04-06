const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// ➤ Create Slot (with overlap check)
function createSlot({ teacher_id, day_of_week, start_time, end_time }, callback) {
  const id = uuidv4();

  const checkQuery = `
    SELECT * FROM teacher_slots
    WHERE teacher_id = ?
    AND day_of_week = ?
    AND (
      start_time < ? AND end_time > ?
    )
  `;

  db.query(
    checkQuery,
    [teacher_id, day_of_week, end_time, start_time],
    (err, result) => {
      if (err) return callback(err, null);

      if (result.length > 0) {
        return callback({ message: "Slot overlaps with existing slot" }, null);
      }

      const insertQuery = `
        INSERT INTO teacher_slots
        (id, teacher_id, day_of_week, start_time, end_time)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [id, teacher_id, day_of_week, start_time, end_time],
        (err) => {
          if (err) return callback(err, null);

          callback(null, {
            slot_id: id,
            day_of_week,
            start_time,
            end_time,
          });
        }
      );
    }
  );
}

// ➤ Get All Slots of Teacher
function getTeacherSlots(teacher_id, callback) {
  const query = `
    SELECT id, day_of_week,start_time, end_time, status
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
    SELECT id, day_of_week,start_time, end_time
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

function getBookedSlots(user_id, callback){
  const userQuery = "SELECT isTeaching FROM users WHERE id = ?";
  db.query(userQuery,[user_id],(err,userResult) => {
    if (err) return callback(err, null);
    if (userResult.length === 0) return callback("User not found", null);

    const isTeacher = userResult[0].isTeaching;
    const query = `
  SELECT ts.start_time, ts.end_time, ts.day_of_week, c.subject
  FROM classes c
  JOIN teacher_slots ts ON ts.class_id = c.id
  WHERE ${isTeacher ? "c.teacher_id = ?" : "c.student_id = ?"}
  AND ts.status = 'booked'
  ORDER BY ts.start_time ASC
`;

    db.query(query, [user_id], (err,result) => {
      if (err) return callback(err, null);

      callback(null, result);
    });

  })
}


function getMySlots(userId, callback) {
  const query = `
    SELECT 
      id,
      day_of_week,
      start_time,
      end_time,
      status
    FROM teacher_slots
    WHERE teacher_id = ?
    ORDER BY 
      FIELD(day_of_week, 
        'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
      ),
      start_time ASC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) return callback(err, null);

    callback(null, result); // empty array is fine
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