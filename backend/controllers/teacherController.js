const teacherModel = require("../models/teacherModel");

async function addDetails(req, res) {
  const user_id = req.user.id;
  const { experience, qualification, bio, hourly_rate } = req.body;
  if (
    experience === undefined ||
    !qualification ||
    hourly_rate == null ||
    bio == null
  ) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }
  teacherModel.addDetails(
    { user_id, experience, qualification, bio, hourly_rate },
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: "Database error",
        });
      }
      res.json({
        success: true,
        message: "Teacher details saved",
      });
    }
  );
}

async function getDetails(req, res) {
  const id = req.params.id;
  teacherModel.getDetails(id, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }
    res.json({
      success: true,
      teacher: result,
    });
  });
}

async function addSubjects(req, res) {
  const id = req.user.id;
  const { subject } = req.body;
  teacherModel.addSubjects({ id, subject }, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }
    res.json({
      success: true,
      message: "Subject added",
    });
  });
}

async function getSubjects(req, res) {
  const teacher_id = req.params.teacher_id;
  teacherModel.getSubjects(teacher_id, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    res.json({
      success: true,
      subjects: result,
    });
  });
}

async function getAllTeachers(req, res) {
  const name = req.query.name;
  teacherModel.getAllTeachers(name,(err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Database error",
      });
    }
    const teachers = result.map((t) => ({
      ...t,
      hourly_rate: Number(t.hourly_rate),
      rating: Number(t.rating),
      subjects: t.subjects ? t.subjects.split(",") : [],
    }));
    res.json({
      success: true,
      teachers
    });
  });
}

module.exports = {
  addDetails,
  getDetails,
  addSubjects,
  getSubjects,
  getAllTeachers,
};
