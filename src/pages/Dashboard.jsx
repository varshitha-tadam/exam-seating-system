import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import FacultyDashboard from '../components/FacultyDashboard';
import StudentDashboard from '../components/StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
