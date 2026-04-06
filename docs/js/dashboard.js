import {
  getCurrentUser,
  addTeacherDetails,
  addSubjects,
  addStudentDetails,
  getSubjects,
  getPendingClasses, 
  acceptClass, 
  rejectClass,
  getActiveClasses,
  getBookedSlots
} from "./api.js";

const sidebar = document.getElementById("sidebar");
const modal = document.getElementById("modal");

let currentUser = null; // 🔥 global state

// ==============================
// INIT
// ==============================

async function init() {
  try {
    const data = await getCurrentUser();
    currentUser = data.user;

    if (currentUser.newUser) {
      modal.classList.remove("hidden");
      sidebar.classList.add("hidden");
    } else {
      loadDashboard();
      loadPage("profile"); // default page
    }
  } catch (err) {
    console.error(err);
  }
}

init();

// ==============================
// DASHBOARD SETUP
// ==============================

function loadDashboard() {
  sidebar.classList.remove("hidden");

  if (!currentUser.isTeaching) {
    document.getElementById("add-slots").style.display = "none";
  }
}

// ==============================
// PAGE ROUTER
// ==============================

function loadPage(page) {
  switch (page) {
    case "profile":
      renderProfile();
      break;
    case "pending":
      renderPending();
      break;
    case "active":
      renderActive();
      break;
    case "schedule":
      renderSchedule();
      break;
    case "slots":
      renderSlots();
      break;
  }

  setActiveTab(page);
}

// ==============================
// SIDEBAR CLICK
// ==============================

document.querySelectorAll(".sidebar li").forEach(item => {
  item.addEventListener("click", () => {
    const page = item.dataset.page;
    loadPage(page);
  });
});

function setActiveTab(page) {
  document.querySelectorAll(".sidebar li").forEach(li => {
    li.classList.remove("active");
  });

  const activeItem = document.querySelector(`[data-page="${page}"]`);
  if (activeItem) activeItem.classList.add("active");
}

// ==============================
// PROFILE PAGE
// ==============================

async function renderProfile() {
  const content = document.getElementById("content");

  content.innerHTML = `<p>Loading profile...</p>`;

  try {
    let extraInfo = "";

    if (currentUser.isTeaching) {
      const subjectsRes = await getSubjects(currentUser.id);
      const subjects = subjectsRes.subjects || [];

      extraInfo = `
        <div class="card">
          <h3>Teacher Info</h3>
          <p><strong>Qualification:</strong> ${currentUser.teacherDetails.qualification || "N/A"}</p>
          <p><strong>Hourly Rate:</strong> ₹${currentUser.teacherDetails.hourly_rate || "N/A"}</p>
          <p><strong>Bio:</strong> ${currentUser.teacherDetails.bio || "N/A"}</p>
          <p><strong>Subjects:</strong> ${subjects.map(s => s.subject).join(", ")}</p>
        </div>
      `;
    } else {
      extraInfo = `
        <div class="card">
          <h3>Student Info</h3>
          <p><strong>Grade:</strong> ${currentUser.studentDetails.grade || "N/A"}</p>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="card">
        <h2>Profile</h2>
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Role:</strong> ${currentUser.isTeaching ? "Teacher" : "Student"}</p>
      </div>

      ${extraInfo}
    `;
  } catch (err) {
    content.innerHTML = `<p>Error loading profile</p>`;
    console.error(err);
  }
}

// ==============================
// PLACEHOLDER PAGES
// ==============================

async function renderActive() {
  const content = document.getElementById("content");

  content.innerHTML = `<p>Loading active classes...</p>`;

  try {
    const res = await getActiveClasses();
    const classes = res.classes || res;

    if (!classes.length) {
      content.innerHTML = `<p>No active classes</p>`;
      return;
    }

    const grouped = groupClasses(classes);

    content.innerHTML = `
      <h2>Active Classes</h2>
      <div class="card-list">
        ${grouped.map(cls => renderActiveCard(cls)).join("")}
      </div>
    `;
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p>Error loading active classes</p>`;
  }
}

function renderActiveCard(cls) {
  return `
    <div class="card">
      <h3>${cls.subject}</h3>

      <p><strong>Student:</strong> ${cls.student_name}</p>
      <p><strong>Teacher:</strong> ${cls.teacher_name}</p>

      <p><strong>Time:</strong></p>
      <ul>
        ${cls.slots.map(slot => `
          <li>
            ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function formatTime(time) {
  if (!time) return "Not scheduled";

  const safeTime = time.includes("T") ? time : time.replace(" ", "T");
  const date = new Date(safeTime);

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

async function renderPending() {
  const content = document.getElementById("content");

  content.innerHTML = `<p>Loading pending classes...</p>`;

  try {
    const res = await getPendingClasses();
    const classes = res.classes || res;

    if (!classes.length) {
      content.innerHTML = `<p>No pending classes</p>`;
      return;
    }

    const grouped = groupClasses(classes);

    content.innerHTML = `
      <h2>Pending Classes</h2>
      <div class="card-list">
        ${grouped.map(cls => renderPendingCard(cls)).join("")}
      </div>
    `;

  } catch (err) {
    console.error(err);
    content.innerHTML = `<p>Error loading classes</p>`;
  }
}

function renderPendingCard(cls) {
  return `
    <div class="card">
      <h3>${cls.subject}</h3>

      <p><strong>Student:</strong> ${cls.student_name}</p>
      <p><strong>Teacher:</strong> ${cls.teacher_name}</p>

      <p><strong>Time:</strong></p>
      <ul>
        ${cls.slots.map(slot => `
          <li>
            ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}
          </li>
        `).join("")}
      </ul>

      ${
        currentUser.isTeaching
          ? `
          <div class="actions">
            <button onclick="handleAccept('${cls.id}')">Accept</button>
            <button onclick="handleReject('${cls.id}')">Reject</button>
          </div>
        `
          : ""
      }
    </div>
  `;
}

async function renderSchedule() {
  const content = document.getElementById("content");

  content.innerHTML = `<p>Loading schedule...</p>`;

  try {
    const res = await getBookedSlots();
    const slots = res.slots || [];

    if (!slots.length) {
      content.innerHTML = `<p>No scheduled classes</p>`;
      return;
    }

    const grouped = groupSlotsByDate(slots);

    content.innerHTML = `
      <h2>Schedule</h2>
      <div class="schedule-container">
        ${Object.keys(grouped).map(date => renderDay(date, grouped[date])).join("")}
      </div>
    `;

  } catch (err) {
    console.error(err);
    content.innerHTML = `<p>Error loading schedule</p>`;
  }
}

function groupSlotsByDate(slots) {
  const map = {};

  slots.forEach(slot => {
    const date = new Date(slot.start_time).toDateString();

    if (!map[date]) map[date] = [];

    map[date].push(slot);
  });

  return map;
}

function renderDay(date, slots) {
  return `
    <div class="day-card">
      <h3>${formatDate(date)}</h3>

      ${slots.map(slot => `
        <div class="slot-item">
          <span class="time">
            ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}
          </span>
          <span class="subject">${slot.subject}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

function renderSlots() {
  document.getElementById("content").innerHTML = `<h2>Add Slots</h2>`;
}

// ==============================
// ONBOARDING FLOW
// ==============================

document.getElementById("student-btn").onclick = () => {
  showStep("step-student");
};

document.getElementById("teacher-btn").onclick = () => {
  showStep("step-teacher");
};

function showStep(stepId) {
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById(stepId).classList.remove("hidden");
}

// STUDENT
document.getElementById("submit-student").onclick = async () => {
  const grade = document.getElementById("student-grade").value;

  if (!grade) return;

  await addStudentDetails({ grade });

  modal.classList.add("hidden");
  location.reload();
};

// TEACHER
document.getElementById("submit-teacher").onclick = async () => {
  const qualification = document.getElementById("qualification").value;
  const hourly_rate = Number(document.getElementById("rate").value);
  const bio = document.getElementById("bio").value;

  const selectedSubjects = getSelectedSubjects();

  if (!selectedSubjects.length) {
    alert("Select at least one subject");
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
    console.error(err);
    alert("Error setting up teacher profile");
  }
};

// ==============================
// SUBJECT HELPER
// ==============================

function getSelectedSubjects() {
  return Array.from(
    document.querySelectorAll(".checkbox-item input:checked")
  ).map(input => input.value);
}

// ==============================
// LOGOUT
// ==============================

document.getElementById("logout-btn").onclick = () => {
  localStorage.removeItem("token");
  window.location.href = "auth.html";
};

window.handleAccept = async function (id) {
  try {
    await acceptClass(id);
    renderPending(); // refresh
  } catch (err) {
    alert("Error accepting class");
  }
};

window.handleReject = async function (id) {
  try {
    await rejectClass(id);
    renderPending();
  } catch (err) {
    alert("Error rejecting class");
  }
};

function groupClasses(classes) {
  const map = {};

  classes.forEach(cls => {
    if (!map[cls.id]) {
      map[cls.id] = {
        id: cls.id,
        subject: cls.subject,
        student_name: cls.student_name,
        teacher_name: cls.teacher_name,
        slots: []
      };
    }

    // push slot if exists
    if (cls.start_time && cls.end_time) {
      map[cls.id].slots.push({
        start_time: cls.start_time,
        end_time: cls.end_time
      });
    }
  });

  return Object.values(map);
}