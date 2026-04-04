const db = require('../config/db');
const { v4: uuidv4 } = require("uuid");

function addDetails(data, callback) {
  const { user_id, grade } = data;

  const insertQuery = `
    INSERT INTO student_details(user_id,grade)
    VALUES(?,?)
  `;

  db.query(insertQuery, [user_id,grade], (err, result) => {
    if (err) return callback(err, null);

    // ✅ update users table
    const updateQuery = `
      UPDATE users SET newUser = false WHERE id = ?
    `;

    db.query(updateQuery, [user_id], (err2) => {
      if (err2) return callback(err2, null);

      return callback(null, {
        message: "Student details added successfully"
      });
    });
  });
}

module.exports = {
  addDetails
}