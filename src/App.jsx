import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import SeatingAllocation from './components/SeatingAllocation';
import Students from './components/Students';
import Halls from './components/Halls';
import Exams from './components/Exams';
import AIChatbot from './components/AIChatbot';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app-container">
        {user && (
          <nav className="nav">
            <div className="nav-brand">Exam Seat Allocation</div>
            <div className="nav-links">
              <Link to="/">Dashboard</Link>
              {(user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'faculty') && (
                <Link to="/allocate">Allocations</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
            <div className="nav-user">
              <span>{user.firstName} ({user.role})</span>
            </div>
          </nav>
        )}

        <main className="content">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                {user?.role.toLowerCase() === 'admin' && <AdminDashboard />}
                {user?.role.toLowerCase() === 'faculty' && <FacultyDashboard />}
                {user?.role.toLowerCase() === 'student' && <StudentDashboard />}
              </ProtectedRoute>
            } />

            <Route path="/allocate" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <SeatingAllocation />
              </ProtectedRoute>
            } />

            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <Students />
              </ProtectedRoute>
            } />

            <Route path="/halls" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <Halls />
              </ProtectedRoute>
            } />

            <Route path="/exams" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <Exams />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {user && <AIChatbot />}
      </div>
    </Router>
  );
}

export default App;