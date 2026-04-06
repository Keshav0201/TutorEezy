const db = require('../config/db');
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function signup(data, callback) {
  const { name, email, password } = data;

  const query = "SELECT id FROM users WHERE email = ?";

  db.query(query, [email], async (err, result) => {
    if (err) return callback(err, null);

    if (result.length > 0) {
      return callback(
        { type: "DUPLICATE_ERROR", message: "User already exists" },
        null
      );
    }

    const user_id = uuidv4();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users
        (id, name, email, password, isTeaching, isAdmin, newUser)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [user_id, name, email, hashedPassword, false, false, true],
        (err, result) => {
          if (err) return callback(err, null);

          const token = jwt.sign(
            { id: user_id, email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );

          return callback(null, {
            message: "User created successfully",
            token,
          });
        }
      );
    } catch (err) {
      return callback(err, null);
    }
  });
}

function login(data, callback) {
  const { email, password } = data;

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, result) => {
    if (err) return callback(err, null);

    if (result.length === 0) {
      return callback(
        { type: "AUTH_ERROR", message: "Invalid email or password" },
        null
      );
    }

    const user = result[0];

    try {
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return callback(
          { type: "AUTH_ERROR", message: "Invalid email or password" },
          null
        );
      }

      const token = jwt.sign(
        { id: user.id, email ,
          isTeaching: user.isTeaching
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return callback(null, {
        message: "Logged in successfully",
        token,
      });

    } catch (err) {
      return callback(err, null);
    }
  });
}

function getCurrentUser(id, callback) {
  const userQuery = `
    SELECT id, name, email, isTeaching, isAdmin, newUser
    FROM users
    WHERE id = ?
  `;

  db.query(userQuery, [id], (err, userResult) => {
    if (err) return callback(err, null);
    if (userResult.length === 0) return callback("User not found", null);

    const user = userResult[0];

    if (user.isTeaching) {
      const teacherQuery = `
        SELECT experience, qualification, bio, hourly_rate
        FROM teacher_details
        WHERE user_id = ?
      `;

      db.query(teacherQuery, [id], (err, teacherResult) => {
        if (err) return callback(err, null);

        user.teacherDetails = teacherResult[0] || null;

        return callback(null, user);
      });
    }

    else {
      const studentQuery = `
        SELECT grade
        FROM student_details
        WHERE user_id = ?
      `;

      db.query(studentQuery, [id], (err, studentResult) => {
        if (err) return callback(err, null);

        user.studentDetails = studentResult[0] || null;

        return callback(null, user);
      });
    }
  });
}

module.exports.login = login;

module.exports = {
    signup,
    login,
    getCurrentUser
}