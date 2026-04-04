const db = require('../config/db');
const { v4: uuidv4 } = require("uuid");

function addDetails(data, callback) {
  const { user_id, experience, qualification, bio, hourly_rate } = data;

  const insertQuery = `
    INSERT INTO teacher_details(user_id,experience,qualification,bio,hourly_rate)
    VALUES(?,?,?,?,?)
  `;

  db.query(insertQuery, [user_id, experience, qualification, bio, hourly_rate], (err, result) => {
    if (err) return callback(err, null);

    // ✅ update users table
    const updateQuery = `
      UPDATE users SET isTeaching = true WHERE id = ?
    `;

    db.query(updateQuery, [user_id], (err2) => {
      if (err2) return callback(err2, null);

      return callback(null, {
        message: "Teacher details added successfully"
      });
    });
  });
}

function getDetails(id, callback){
    const query = 'SELECT * FROM teacher_details WHERE user_id = ?';
    db.query(query,[id], (err,result) => {
        if(err){
            return callback(err,null);
        };
        if(result.length === 0){
            return callback("Teacher does not exists");
        }
        callback(null, result[0]);
    })
}

function addSubjects({id,subject}, callback){
    const query = "INSERT INTO teacher_subjects(id,teacher_id,subject) VALUES (?,?,?)";
    db.query(query,[uuidv4(), id, subject],(err,result) => {
        if(err){
            return callback(err,null);
        };
        callback(null, result);
    })
}

function getSubjects(teacher_id, callback){
    console.log(teacher_id);
    const query = "SELECT id, subject FROM teacher_subjects WHERE teacher_id = ?";
    db.query(query,[teacher_id], (err,result) => {
        if(err){
            return callback(err,null);
        };
        if(result.length === 0){
            return callback("Subject does not exists",null);
        }
        callback(null, result);
    })
}

module.exports = {
    addDetails,
    getDetails,
    addSubjects,
    getSubjects
}