const studentModel = require('../models/studentModel');

async function addDetails(req, res) {
  const user_id = req.user.id;
  const { grade } = req.body;
  if (!grade) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }
  studentModel.addDetails(
    { user_id, grade },
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: "Database error",
        });
      }
      res.json({
        success: true,
        message: "Student details saved",
      });
    }
  );
}

module.exports = {
    addDetails
}