import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./index.css";

// Seed demo users into localStorage on first load
const seedDemoUsers = () => {
  const demoUsers = [
    { id: 1, name: 'Admin User', email: 'admin@college.edu', password: 'admin123', role: 'admin' },
    { id: 2, name: 'Dr. Kumar', email: 'faculty@college.edu', password: 'faculty123', role: 'faculty' },
    { id: 3, name: 'Dr. Sharma', email: 'sharma@college.edu', password: 'faculty123', role: 'faculty' },
    { id: 4, name: 'Prof. Verma', email: 'verma@college.edu', password: 'faculty123', role: 'faculty' },
    { id: 5, name: 'Rahul Kumar', email: 'student@college.edu', password: 'student123', role: 'student', section: 'CSE-A', regNo: '2023CS001' },
    { id: 6, name: 'Priya Sharma', email: 'priya@college.edu', password: 'student123', role: 'student', section: 'CSE-B', regNo: '2023CS042' },
    { id: 7, name: 'Anish Raj', email: 'anish@college.edu', password: 'student123', role: 'student', section: 'CSE-A', regNo: '2023CS015' },
    { id: 8, name: 'Vikram Singh', email: 'vikram@college.edu', password: 'student123', role: 'student', section: 'CSE-C', regNo: '2023CS088' },
    { id: 9, name: 'Sneha Reddy', email: 'sneha@college.edu', password: 'student123', role: 'student', section: 'CSE-C', regNo: '2023CS092' },
  ];

  const existing = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
  
  // Merge: Only add demo users if their email isn't already there
  const merged = [...existing];
  demoUsers.forEach(du => {
    if (!merged.find(u => u.email.toLowerCase() === du.email.toLowerCase())) {
      merged.push(du);
    }
  });

  localStorage.setItem('smarttable_users', JSON.stringify(merged));

  // Seed subjects if they don't exist
  if (!localStorage.getItem('tt_subjects')) {
    localStorage.setItem('tt_subjects', JSON.stringify([
      { id: 1, name: 'Software Engineering', hoursPerWeek: 5, isLab: false },
      { id: 2, name: 'DBMS', hoursPerWeek: 5, isLab: false },
      { id: 3, name: 'Data Structures', hoursPerWeek: 5, isLab: false },
      { id: 4, name: 'Computer Networks', hoursPerWeek: 5, isLab: false },
      { id: 5, name: 'Operating Systems', hoursPerWeek: 5, isLab: false },
      { id: 6, name: 'Systems Lab', hoursPerWeek: 3, isLab: true },
    ]));
  }

  // Seed faculty pool if it doesn't exist
  if (!localStorage.getItem('tt_faculty')) {
    localStorage.setItem('tt_faculty', JSON.stringify([
      { id: 1, name: 'Prof. Rao', subject: 'Software Engineering' },
      { id: 2, name: 'Dr. Sharma', subject: 'DBMS' },
      { id: 3, name: 'Dr. Kumar', subject: 'Data Structures' },
      { id: 4, name: 'Dr. Reddy', subject: 'Computer Networks' },
      { id: 5, name: 'Prof. Verma', subject: 'Operating Systems' },
      { id: 6, name: 'Dr. Singh', subject: 'Systems Lab' },
    ]));
  }

  // Seed sample data for attendance and marks if they don't exist
  if (!localStorage.getItem('tt_attendance')) {
    localStorage.setItem('tt_attendance', JSON.stringify({}));
  }
  if (!localStorage.getItem('tt_marks')) {
    localStorage.setItem('tt_marks', JSON.stringify({}));
  }
  
  // Seed sample sections with in-charge
  if (!localStorage.getItem('tt_sections')) {
    localStorage.setItem('tt_sections', JSON.stringify([
      { id: 1, name: 'CSE-A', department: 'Computer Science', year: 2, inCharge: 'Dr. Kumar' },
      { id: 2, name: 'CSE-B', department: 'Computer Science', year: 2, inCharge: 'Dr. Sharma' },
      { id: 3, name: 'CSE-C', department: 'Computer Science', year: 2, inCharge: 'Prof. Verma' },
    ]));
  }

  // Seed some sample exam allocations so students see something
  const existingAlloc = localStorage.getItem('tt_exam_allocations');
  if (!existingAlloc) {
    const sampleAlloc = {
      "Data Structures": {
        "Hall A": [
          [{ name: "Rahul Kumar", regNo: "2023CS001", seat: "R1C1" }, { name: "Anish Raj", regNo: "2023CS015", seat: "R1C2" }],
          [{ name: "Other Student", regNo: "2023CS099", seat: "R2C1" }, null]
        ]
      },
      "DBMS": {
        "Hall C": [
          [{ name: "Priya Sharma", regNo: "2023CS042", seat: "R1C1" }, null]
        ]
      }
    };
    localStorage.setItem('tt_exam_allocations', JSON.stringify(sampleAlloc));
  }
};
seedDemoUsers();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);