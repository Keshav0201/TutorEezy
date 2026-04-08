import { getTeachers, getAvailableSlots }from "./api.js";

const container = document.getElementById("teacherContainer");
const searchInput = document.querySelector(".search-bar input");

// STATE
let selectedTeacher = null;
let selectedSubject = null;
let selectedSlots = [];

/* ================= FETCH TEACHERS ================= */
async function loadTeachers(search = "") {
  try {
    const data = await getTeachers(search);
    renderTeachers(data.teachers || []);
  } catch (err) {
    console.error("Error loading teachers:", err);
    container.innerHTML = "Failed to load teachers";
  }
}

/* ================= RENDER TEACHERS ================= */
function renderTeachers(teachers) {
  container.innerHTML = "";

  if (!teachers.length) {
    container.innerHTML = "<p>No teachers found</p>";
    return;
  }

  teachers.forEach((t) => {
    const card = document.createElement("div");
    card.className = "teacher-card";

    card.innerHTML = `
      <h3>${t.name}</h3>
      <p>${t.subjects.join(", ")}</p>
      <p>⭐ ${t.rating}</p>
      <p>₹${t.hourly_rate}/hr</p>
      <button class="request-btn">Request Class</button>
    `;

    const btn = card.querySelector(".request-btn");

    btn.addEventListener("click", (event) => {
      handleRequest(event, t.id, t.subjects);
    });

    container.appendChild(card);
  });
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", (e) => {
  loadTeachers(e.target.value);
});

/* ================= NAVIGATION ================= */
window.goToAuth = function () {
  window.location.href = "auth.html";
};

/* ================= REQUEST FLOW ================= */
window.handleRequest = function (event, teacherId, subjects) {
  selectedTeacher = teacherId;
  selectedSubject = null;
  selectedSlots = [];

  openModal();
  populateSubjects(subjects);
  loadSlots(teacherId);
};

/* ================= MODAL ================= */
function openModal() {
  document.getElementById("requestModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal() {
  document.getElementById("requestModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

/* ================= SUBJECT ================= */
function populateSubjects(subjects) {
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";

  subjects.forEach((sub, index) => {
    const chip = document.createElement("div");
    chip.className = "subject-chip";
    chip.innerText = sub;

    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".subject-chip")
        .forEach((c) => c.classList.remove("selected"));

      chip.classList.add("selected");
      selectedSubject = sub;
    });

    container.appendChild(chip);

    // ✅ auto select first subject
    if (index === 0) {
      chip.click();
    }
  });
}

/* ================= LOAD SLOTS ================= */
async function loadSlots(teacherId) {
  const container = document.getElementById("slotsContainer");
  container.innerHTML = "Loading...";

  try {
    const res = await getAvailableSlots(teacherId);

    if (!res.success) {
      container.innerHTML = "Failed to load slots";
      return;
    }

    renderSlots(res.slots || []);
  } catch (err) {
    console.error(err);
    container.innerHTML = "Error loading slots";
  }
}

/* ================= SLOT CLICK (EVENT DELEGATION) ================= */
const slotsContainer = document.getElementById("slotsContainer");

slotsContainer.addEventListener("click", (e) => {
  const slotDiv = e.target.closest(".slot");

  if (!slotDiv) return;
  if (slotDiv.classList.contains("booked")) return;

  const slotId = slotDiv.dataset.id;

  const index = selectedSlots.indexOf(slotId);

  if (index > -1) {
    selectedSlots.splice(index, 1);
    slotDiv.classList.remove("selected");
  } else {
    selectedSlots.push(slotId);
    slotDiv.classList.add("selected");
  }
});

/* ================= RENDER SLOTS ================= */
function renderSlots(slots) {
  const container = document.getElementById("slotsContainer");

  if (!slots || slots.length === 0) {
    container.innerHTML = "<p>No slots available</p>";
    return;
  }

  container.innerHTML = slots
    .map(
      (slot) => `
    <div class="slot ${slot.status}" data-id="${slot.id}">
      <span>${slot.day_of_week}</span>
      <span>${slot.start_time} - ${slot.end_time}</span>
    </div>
  `
    )
    .join("");
}

/* ================= CONFIRM ================= */
document.getElementById("confirmRequest").addEventListener("click", () => {
  if (!selectedSubject || selectedSlots.length === 0) {
    alert("Please select subject and at least one slot");
    return;
  }

  console.log({
    teacher: selectedTeacher,
    subject: selectedSubject,
    slots: selectedSlots,
  });

  alert("Next step: backend integration");

  closeModal();
});

/* ================= INIT ================= */
loadTeachers();