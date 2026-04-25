import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Timetable ──────────────────────────────────────────
export const timetableService = {
  getAll:    ()         => api.get('/timetable'),
  getBySection: (sec)   => api.get(`/timetable?section=${sec}`),
  generate:  ()         => api.post('/timetable/generate'),
};

// ── Faculty ────────────────────────────────────────────
export const facultyService = {
  getAll:   ()          => api.get('/faculty'),
  create:   (data)      => api.post('/faculty', data),
  update:   (id, data)  => api.put(`/faculty/${id}`, data),
  remove:   (id)        => api.delete(`/faculty/${id}`),
};

// ── Subjects ───────────────────────────────────────────
export const subjectService = {
  getAll:   ()          => api.get('/subjects'),
  create:   (data)      => api.post('/subjects', data),
  update:   (id, data)  => api.put(`/subjects/${id}`, data),
  remove:   (id)        => api.delete(`/subjects/${id}`),
};

// ── Classrooms ─────────────────────────────────────────
export const classroomService = {
  getAll:   ()          => api.get('/classrooms'),
  create:   (data)      => api.post('/classrooms', data),
  update:   (id, data)  => api.put(`/classrooms/${id}`, data),
  remove:   (id)        => api.delete(`/classrooms/${id}`),
};

// ── Sections ───────────────────────────────────────────
export const sectionService = {
  getAll:   ()          => api.get('/sections'),
  create:   (data)      => api.post('/sections', data),
  update:   (id, data)  => api.put(`/sections/${id}`, data),
  remove:   (id)        => api.delete(`/sections/${id}`),
};

export default api;
