import {
  getCurrentUser,
  addTeacherDetails,
  addSubjects,
  addStudentDetails,
} from "./api.js";

const sidebar = document.getElementById("sidebar");
const modal = document.getElementById("modal");


async function init() {
  try {
    const data = await getCurrentUser();
    const user = data.user[0] || data;
    if (user.newUser) {
      modal.classList.remove("hidden");
      sidebar.classList.add("hidden");
    } else {
      loadDashboard(user);
    }
  } catch (err) {
    console.error(err);
  }
}

init();

function loadDashboard(user) {
  sidebar.classList.remove("hidden");

  if (!user.isTeaching) {
    document.getElementById("add-slots").style.display = "none";
  }
}


document.getElementById("student-btn").onclick = () => {
  showStep("step-student");
};

document.getElementById("teacher-btn").onclick = () => {
  showStep("step-teacher");
};

function showStep(stepId) {
  document.querySelectorAll(".step").forEach((s) => s.classList.add("hidden"));
  document.getElementById(stepId).classList.remove("hidden");
}


document.getElementById("submit-student").onclick = async () => {
  const grade = document.getElementById("student-grade").value;

  if (!grade) return;

  await addStudentDetails({ grade });

  modal.classList.add("hidden");
  location.reload();
};

document.getElementById("submit-teacher").onclick = async () => {
  const qualification = document.getElementById("qualification").value;
  const hourly_rate = Number(document.getElementById("rate").value);
  const bio = document.getElementById("bio").value;

  const selectedSubjects = getSelectedSubjects();

  if (selectedSubjects.length === 0) {
    alert("Please select at least one subject");
    return;
  }

  try {
    await addTeacherDetails({
      qualification,
      hourly_rate,
      bio,
      experience: 0,
    });

    for (let subject of selectedSubjects) {
      await addSubjects({ subject }); 
    }

    modal.classList.add("hidden");
    location.reload();
  } catch (err) {
    console.log(err);
    alert("Error setting up teacher profile");
  }
};



document.getElementById("logout-btn").onclick = () => {
  localStorage.removeItem("token");
  window.location.href = "auth.html";
};

function getSelectedSubjects() {
  return Array.from(
    document.querySelectorAll(".checkbox-item input:checked")
  ).map((input) => input.value);
}
