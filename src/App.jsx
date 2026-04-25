import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Timetable from "./pages/Timetable";
import Faculty from "./pages/Faculty";
import Subjects from "./pages/Subjects";
import Classrooms from "./pages/Classrooms";
import Sections from "./pages/Sections";
import ExamSeating from "./pages/ExamSeating";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UsersManagement from "./pages/UsersManagement";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/exam-seating" element={<ExamSeating />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/classrooms" element={<Classrooms />} />
              <Route path="/sections" element={<Sections />} />
              <Route path="/users" element={<UsersManagement />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;