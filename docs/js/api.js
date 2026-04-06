// api.js

import { BASE_URL, fetchWithRetry } from "./config.js";

// ==============================
// 🔐 TOKEN HANDLING
// ==============================

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "auth.html"; // adjust if needed
}

// ==============================
// 🌐 CORE API REQUEST WRAPPER
// ==============================

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    // 🔥 Handle Unauthorized globally
    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }

    // ❌ Handle other errors
    if (!response.ok) {
      throw new Error(data.message || data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
}

// ==============================
// 🔐 AUTH APIs
// ==============================

export async function signup({ name, email, password }) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
}

export async function login({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET"
  });
}

// ==============================
// 👨‍🏫 TEACHER APIs
// ==============================

export async function addTeacherDetails({
  experience,
  qualification,
  bio,
  hourly_rate
}) {
  return apiRequest("/teachers/details", {
    method: "POST",
    body: JSON.stringify({
      experience,
      qualification,
      bio,
      hourly_rate
    })
  });
}

export async function addSubjects(subject) {
  return apiRequest("/teachers/subjects", {
    method: "POST",
    body: JSON.stringify( subject )
  });
}

export async function getSubjects(teacherId) {
  return apiRequest(`/teachers/${teacherId}/subjects`, {
    method: "GET"
  });
}

// ==============================
// ⏰ SLOT APIs
// ==============================

export async function createSlot({ day_of_week, start_time, end_time }) {
  return apiRequest("/slots", {
    method: "POST",
    body: JSON.stringify({ day_of_week, start_time, end_time })
  });
}

export async function getTeacherSlots(teacherId) {
  return apiRequest(`/slots/teacher/${teacherId}`, {
    method: "GET"
  });
}

export async function getMySlots() {
  return apiRequest("/slots", {
    method: "GET"
  });
}

export async function getAvailableSlots(teacherId) {
  return apiRequest(`/slots/available/${teacherId}`, {
    method: "GET"
  });
}

export async function deleteSlot(slotId) {
  return apiRequest(`/slots/${slotId}`, {
    method: "DELETE"
  });
}

// ==============================
// 📚 CLASS APIs
// ==============================

export async function requestClass({
  teacher_id,
  subject,
  slot_ids
}) {
  return apiRequest("/classes", {
    method: "POST",
    body: JSON.stringify({
      teacher_id,
      subject,
      slot_ids
    })
  });
}

export async function getActiveClasses() {
  return apiRequest("/classes/active", {
    method: "GET",
  });
}

export async function getPendingClasses() {
  return apiRequest("/classes/pending", {
    method: "GET",
  });
}

export async function acceptClass(classId) {
  return apiRequest(`/classes/${classId}/accept`, {
    method: "PUT"
  });
}

export async function rejectClass(classId) {
  return apiRequest(`/classes/${classId}/reject`, {
    method: "PUT"
  });
}

export async function getClassDetails(classId) {
  return apiRequest(`/classes/${classId}`, {
    method: "GET"
  });
}


export async function addStudentDetails({ grade }) {
  return apiRequest("/students/details", {
    method: "POST",
    body: JSON.stringify({ grade })
  });
}

export async function getBookedSlots() {
  return apiRequest("/slots/booked", {
    method: "GET",
  });
}