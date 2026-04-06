const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ➤ Request Class (TRANSACTION 🔥)
function requestClass({ teacher_id, student_id, subject, slot_ids }, callback) {
  const class_id = uuidv4();

  db.beginTransaction((err) => {
    if (err) return callback(err);

    // 🔥 0. Check if student is actually a student
    const checkUser = `SELECT isTeaching FROM users WHERE id = ?`;

    db.query(checkUser, [student_id], (err, result) => {
      if (err) return db.rollback(() => callback(err));

      if (result.length === 0) {
        return db.rollback(() => callback({ message: "User not found" }));
      }

      if (result[0].isTeaching) {
        return db.rollback(() =>
          callback({ message: "Teachers cannot request classes" })
        );
      }

      // 1. Create class
      const insertClass = `
        INSERT INTO classes (id, teacher_id, student_id, subject)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertClass,
        [class_id, teacher_id, student_id, subject],
        (err) => {
          if (err) return db.rollback(() => callback(err));

          // 2. Update slots → pending + attach class
          const updateSlots = `
            UPDATE teacher_slots
            SET status = 'pending', class_id = ?
            WHERE id IN (?) AND status = 'free'
          `;

          db.query(updateSlots, [class_id, slot_ids], (err, result) => {
            if (err) return db.rollback(() => callback(err));

            if (result.affectedRows !== slot_ids.length) {
              return db.rollback(() =>
                callback({ message: "Some slots already booked" })
              );
            }

            db.commit((err) => {
              if (err) return db.rollback(() => callback(err));

              callback(null, {
                message: "Class request sent",
                class_id,
              });
            });
          });
        }
      );
    });
  });
}

// ➤ Teacher classes
function getTeacherClasses(teacher_id, callback) {
  const query = `
    SELECT id, student_id, subject, status
    FROM classes
    WHERE teacher_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [teacher_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

// ➤ Student classes
function getStudentClasses(student_id, callback) {
  const query = `
    SELECT id, teacher_id, subject, status
    FROM classes
    WHERE student_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [student_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

// ➤ Accept Class
function acceptClass(class_id, teacher_id, callback) {
  db.beginTransaction((err) => {
    if (err) return callback(err);

    // 1. Update class
    const updateClass = `
      UPDATE classes
      SET status = 'accepted'
      WHERE id = ? AND teacher_id = ?
    `;

    db.query(updateClass, [class_id, teacher_id], (err) => {
      if (err) return db.rollback(() => callback(err));

      // 2. Update slots → booked
      const updateSlots = `
        UPDATE teacher_slots
        SET status = 'booked'
        WHERE class_id = ?
      `;

      db.query(updateSlots, [class_id], (err) => {
        if (err) return db.rollback(() => callback(err));

        db.commit(callback);
      });
    });
  });
}

// ➤ Reject Class
function rejectClass(class_id, teacher_id, callback) {
  db.beginTransaction((err) => {
    if (err) return callback(err);

    // 1. Update class
    const updateClass = `
      UPDATE classes
      SET status = 'rejected'
      WHERE id = ? AND teacher_id = ?
    `;

    db.query(updateClass, [class_id, teacher_id], (err) => {
      if (err) return db.rollback(() => callback(err));

      // 2. Free slots
      const updateSlots = `
        UPDATE teacher_slots
        SET status = 'free', class_id = NULL
        WHERE class_id = ?
      `;

      db.query(updateSlots, [class_id], (err) => {
        if (err) return db.rollback(() => callback(err));

        db.commit(callback);
      });
    });
  });
}

// ➤ Get Class Details (with slots 🔥)
function getClassDetails(class_id, callback) {
  const query = `
    SELECT c.*, ts.id AS slot_id, ts.start_time, ts.end_time
    FROM classes c
    LEFT JOIN teacher_slots ts ON ts.class_id = c.id
    WHERE c.id = ?
  `;

  db.query(query, [class_id], (err, result) => {
    if (err) return callback(err, null);

    if (result.length === 0) return callback(null, null);

    const classData = {
      id: result[0].id,
      teacher_id: result[0].teacher_id,
      student_id: result[0].student_id,
      subject: result[0].subject,
      status: result[0].status,
      slots: result.map((r) => ({
        id: r.slot_id,
        start_time: r.start_time,
        end_time: r.end_time,
      })),
    };

    callback(null, classData);
  });
}

function getPendingClasses(userId, callback) {
  // first get user role
  const userQuery = "SELECT isTeaching FROM users WHERE id = ?";

  db.query(userQuery, [userId], (err, userResult) => {
    if (err) return callback(err, null);
    if (userResult.length === 0) return callback("User not found", null);

    const isTeacher = userResult[0].isTeaching;

    const query = `
  SELECT 
    c.id,
    c.subject,
    c.status,
    s.name AS student_name,
    t.name AS teacher_name,
    ts.start_time,
    ts.end_time
  FROM classes c
  JOIN users s ON c.student_id = s.id
  JOIN users t ON c.teacher_id = t.id
  JOIN teacher_slots ts ON ts.class_id = c.id
  WHERE ${isTeacher ? "c.teacher_id = ?" : "c.student_id = ?"}
  AND c.status = 'pending'
  ORDER BY ts.start_time ASC
`;

    db.query(query, [userId], (err, results) => {
      if (err) return callback(err, null);

      callback(null, results);
    });
  });
}

function getActiveClasses(userId, callback) {
  // first get user role
  const userQuery = "SELECT isTeaching FROM users WHERE id = ?";

  db.query(userQuery, [userId], (err, userResult) => {
    if (err) return callback(err, null);
    if (userResult.length === 0) return callback("User not found", null);

    const isTeacher = userResult[0].isTeaching;

    const query = `
  SELECT 
    c.id,
    c.subject,
    c.status,
    s.name AS student_name,
    t.name AS teacher_name,
    ts.start_time,
    ts.end_time
  FROM classes c
  JOIN users s ON c.student_id = s.id
  JOIN users t ON c.teacher_id = t.id
  JOIN teacher_slots ts ON ts.class_id = c.id
  WHERE ${isTeacher ? "c.teacher_id = ?" : "c.student_id = ?"}
  AND c.status = 'accepted'
  ORDER BY ts.start_time ASC
`;

    db.query(query, [userId], (err, results) => {
      if (err) return callback(err, null);

      callback(null, results);
    });
  });
}

module.exports = {
  requestClass,
  getTeacherClasses,
  getStudentClasses,
  acceptClass,
  rejectClass,
  getClassDetails,
  getPendingClasses,
  getActiveClasses,
};
