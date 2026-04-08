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
  getBookedSlots,
  getMySlots, 
  createSlot
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
      loadPage("profile"); 
    }
  } catch (err) {
    console.error("User not authenticated");
    localStorage.removeItem("token");
    window.location.href = "auth.html";
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

document.querySelectorAll(".sidebar li").forEach((item) => {
  item.addEventListener("click", () => {
    const page = item.dataset.page;
    loadPage(page);
  });
});

function setActiveTab(page) {
  document.querySelectorAll(".sidebar li").forEach((li) => {
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
          <p><strong>Qualification:</strong> ${
            currentUser.teacherDetails.qualification || "N/A"
          }</p>
          <p><strong>Hourly Rate:</strong> ₹${
            currentUser.teacherDetails.hourly_rate || "N/A"
          }</p>
          <p><strong>Bio:</strong> ${
            currentUser.teacherDetails.bio || "N/A"
          }</p>
          <p><strong>Subjects:</strong> ${subjects
            .map((s) => s.subject)
            .join(", ")}</p>
        </div>
      `;
    } else {
      extraInfo = `
        <div class="card">
          <h3>Student Info</h3>
          <p><strong>Grade:</strong> ${
            currentUser.studentDetails.grade || "N/A"
          }</p>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="card">
        <h2>Profile</h2>
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Role:</strong> ${
          currentUser.isTeaching ? "Teacher" : "Student"
        }</p>
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
        ${grouped.map((cls) => renderActiveCard(cls)).join("")}
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
        ${cls.slots
          .map(
            (slot) => `
          <li>
            ${slot.day_of_week} → ${formatOnlyTime(
              slot.start_time
            )} - ${formatOnlyTime(slot.end_time)}
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}

function formatOnlyTime(time) {
  const safe = time.includes("T") ? time : `1970-01-01T${time}`;
  const date = new Date(safe);

  return date.toLocaleTimeString("en-IN", {
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
        ${grouped.map((cls) => renderPendingCard(cls)).join("")}
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
        ${cls.slots
          .map(
            (slot) => `
          <li>
            ${slot.day_of_week} → 
            ${formatOnlyTime(slot.start_time)} - ${formatOnlyTime(
              slot.end_time
            )}
          </li>
        `
          )
          .join("")}
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

    const grouped = groupSlotsByDay(slots);

    content.innerHTML = `
  <h2>Schedule</h2>
  <div class="schedule-container">
    ${Object.keys(grouped)
      .map((day) => renderDay(day, grouped[day]))
      .join("")}
  </div>
`;
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p>Error loading schedule</p>`;
  }
}

function groupSlotsByDay(slots) {
  const map = {};

  slots.forEach((slot) => {
    const day = slot.day_of_week;

    if (!map[day]) map[day] = [];

    map[day].push(slot);
  });

  return map;
}

function renderDay(day, slots) {
  return `
    <div class="day-card">
      <h3>${day}</h3>

      ${slots.map(slot => `
        <div class="slot-item">
          <span class="time">
            ${formatOnlyTime(slot.start_time)} - ${formatOnlyTime(slot.end_time)}
          </span>
          <span class="subject">${slot.subject}</span>
        </div>
      `).join("")}
    </div>
  `;
}

async function renderSlots() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <h2>Add Slots</h2>

    <div class="card">
      <label>Day</label>
      <select id="slot-day">
        <option>Monday</option>
        <option>Tuesday</option>
        <option>Wednesday</option>
        <option>Thursday</option>
        <option>Friday</option>
        <option>Saturday</option>
        <option>Sunday</option>
      </select>

      <label>Time</label>
      <select id="slot-time">
        ${generateTimeOptions()}
      </select>

      <button class="primary-btn" onclick="handleAddSlot()">Add Slot</button>
    </div>

    <div id="slots-list"></div>
  `;

  loadSlots(); // 🔥 load existing slots
}

function generateTimeOptions() {
  let options = "";

  for (let i = 6; i <= 22; i++) {
    const hour = i > 12 ? i - 12 : i;
    const suffix = i >= 12 ? "PM" : "AM";

    options += `<option value="${i}">${hour} ${suffix}</option>`;
  }

  return options;
}

window.handleAddSlot = async function () {
  const day = document.getElementById("slot-day").value;
  const hour = Number(document.getElementById("slot-time").value);

  const start_time = `${String(hour).padStart(2, "0")}:00:00`;
  const end_time = `${String(hour + 1).padStart(2, "0")}:00:00`;

  try {
    await createSlot({
      day_of_week: day,
      start_time,
      end_time,
    });

    alert("Slot added!");
    loadSlots(); // refresh
  } catch (err) {
    alert(err.message || "Error adding slot");
  }
};

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
  document.querySelectorAll(".step").forEach((s) => s.classList.add("hidden"));
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
  ).map((input) => input.value);
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

  classes.forEach((cls) => {
    if (!map[cls.id]) {
      map[cls.id] = {
        id: cls.id,
        subject: cls.subject,
        student_name: cls.student_name,
        teacher_name: cls.teacher_name,
        slots: [],
      };
    }

    if (cls.start_time && cls.end_time) {
      map[cls.id].slots.push({
        day_of_week: cls.day_of_week, // 🔥 NEW
        start_time: cls.start_time,
        end_time: cls.end_time,
      });
    }
  });

  return Object.values(map);
}

async function loadSlots() {
  const container = document.getElementById("slots-list");

  try {
    const res = await getMySlots();
    const slots = res.slots || [];

    if (!slots.length) {
      container.innerHTML = "<p>No slots added</p>";
      return;
    }

    container.innerHTML = `
      <h3>Your Slots</h3>
      ${slots.map(renderSlotItem).join("")}
    `;
  } catch (err) {
    container.innerHTML = "<p>Error loading slots</p>";
  }
}

function renderSlotItem(slot) {
  return `
    <div class="slot-item">
      <span>
        ${slot.day_of_week} → 
        ${formatOnlyTime(slot.start_time)} - ${formatOnlyTime(slot.end_time)}
      </span>

      <span class="status ${slot.status}">
        ${slot.status.toUpperCase()}
      </span>
    </div>
  `;
}

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "index.html";
});