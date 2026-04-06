const classModel = require("../models/classModel");


// ➤ Request Class
async function requestClass(req, res) {
  const student_id = req.user.id;
  const { teacher_id, subject, slot_ids } = req.body;

  if (!teacher_id || !subject || !slot_ids?.length) {
    return res.status(400).json({
      error: "Missing fields",
    });
  }

  classModel.requestClass(
    { teacher_id, student_id, subject, slot_ids },
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: err.message || "Database error",
        });
      }

      res.json({
        success: true,
        message: "Class request sent",
      });
    }
  );
}

// ➤ Teacher dashboard
function getTeacherClasses(req, res) {
  const teacher_id = req.user.id;

  classModel.getTeacherClasses(teacher_id, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ success: true, classes: result });
  });
}

// ➤ Student classes
function getStudentClasses(req, res) {
  const student_id = req.user.id;

  classModel.getStudentClasses(student_id, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ success: true, classes: result });
  });
}


// ➤ Accept
function acceptClass(req, res) {
  const teacher_id = req.user.id;
  const { classId } = req.params;

  classModel.acceptClass(classId, teacher_id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      success: true,
      message: "Class accepted",
    });
  });
}


// ➤ Reject
function rejectClass(req, res) {
  const teacher_id = req.user.id;
  const { classId } = req.params;

  classModel.rejectClass(classId, teacher_id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      success: true,
      message: "Class rejected",
    });
  });
}


// ➤ Get class details
function getClassDetails(req, res) {
  const { classId } = req.params;

  classModel.getClassDetails(classId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({
      success: true,
      class: result,
    });
  });
}

function getPendingClasses(req,res){
  const userId = req.user.id;

  classModel.getPendingClasses(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json({ classes: result });
  });
}

function getActiveClasses(req,res){
  const userId = req.user.id;

  classModel.getActiveClasses(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json({ classes: result });
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
  getActiveClasses
};