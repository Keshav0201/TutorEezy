import {
  getTeacherDetails,
  requestClass,
  checkLogin,
  getAvailableSlots,
} from "./api.js";

const container = document.getElementById("teacherContainer");

const params = new URLSearchParams(window.location.search);
const teacherId = params.get("id");
const confButton = document.getElementById("confirmRequest");

let currentTeacher = null;
let selectedSubject = null;
let selectedSlots = [];

/* LOAD PAGE */
async function loadTeacher() {
  try {
    const res = await getTeacherDetails(teacherId);

    if (!res.success) {
      container.innerHTML = "Teacher not found";
      return;
    }

    const teacher = res.teacher; // adjust if your API differs

    currentTeacher = teacher;
    document.title = teacher.name;

    renderTeacher(teacher);
  } catch (err) {
    console.error(err);
    container.innerHTML = "Error loading teacher";
  }
}

/* RENDER */
function renderTeacher(t) {
  container.innerHTML = `
    <div class="teacher-card">
    <div class="profile-section">
        <img 
          src="https://ui-avatars.com/api/?name=Keshav&background=273c75&color=fff" 
          alt="Profile" 
          class="profile-img"
        />
      </div>
      <div class="teacher-header">
        <h2>${t.name}</h2>
        <span>⭐ ${t.rating}</span>
      </div>

      <p>₹${t.hourly_rate}/hr</p>

      <div class="subject-container">
        ${t.subjects
          .map((s) => `<div class="subject-chip">${s}</div>`)
          .join("")}
      </div>

      <button id="requestBtn" class="primary-btn">Request Class</button>
    </div>
  `;

  setupSubjects(t.subjects);

  document.getElementById("requestBtn").addEventListener("click", openModal);
}

/* SUBJECT SELECTION */
function setupSubjects(subjects) {
  const chips = document.querySelectorAll(".subject-chip");

  chips.forEach((chip, index) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedSubject = subjects[index];
    });

    if (index === 0) chip.click();
  });
}

/* MODAL */
window.openModal = function () {
  document.getElementById("requestModal").classList.remove("hidden");
  loadSlots();
};

window.closeModal = function () {
  document.getElementById("requestModal").classList.add("hidden");
};

/* LOAD SLOTS */
async function loadSlots() {
  const slotDiv = document.getElementById("slotsContainer");
  slotDiv.innerHTML = "Loading...";
  confButton.disabled = false;

  try {
    const res = await getAvailableSlots(teacherId);
    if(res.slots.length == 0){
        slotDiv.innerHTML = "No available slots";
        confButton.disabled = true;
        return;
    }
    renderSlots(res.slots || []);
  } catch {
    slotDiv.innerHTML = "Error loading slots";
  }
}

/* RENDER SLOTS */
function renderSlots(slots) {
  const container = document.getElementById("slotsContainer");

  container.innerHTML = slots
    .map(
      (slot) => `
    <div class="slot ${slot.status}" data-id="${slot.id}">
      ${slot.day_of_week} (${slot.start_time} - ${slot.end_time})
    </div>
  `
    )
    .join("");
}

/* SLOT CLICK */
document.getElementById("slotsContainer").addEventListener("click", (e) => {
  const slot = e.target.closest(".slot");
  if (!slot || slot.classList.contains("booked")) return;

  const id = slot.dataset.id;

  if (selectedSlots.includes(id)) {
    selectedSlots = selectedSlots.filter((s) => s !== id);
    slot.classList.remove("selected");
  } else {
    selectedSlots.push(id);
    slot.classList.add("selected");
  }
});

/* CONFIRM */
document
  .getElementById("confirmRequest")
  .addEventListener("click", async () => {
    if (!selectedSubject || selectedSlots.length === 0) {
      alert("Select subject & slots");
      return;
    }

    const loggedIn = await checkLogin();

    if (!loggedIn) {
      alert("Login required");
      window.location.href = "auth.html";
      return;
    }
    console.log({
      teacher_id: currentTeacher.id,
      subject: selectedSubject,
      slot_ids: selectedSlots,
    });
    try {
      const res = await requestClass({
        teacher_id: currentTeacher.id,
        subject: selectedSubject,
        slot_ids: selectedSlots,
      });

      if (res.success) {
        alert("Class requested!");
      }
    } catch (err) {
      alert(err.message);
    }

    closeModal();
  });

/* INIT */
loadTeacher();
