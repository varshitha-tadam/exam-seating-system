import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Users, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManager = ({ facultyName }) => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const allSections = JSON.parse(localStorage.getItem('tt_sections') || '[]');
    // Filter sections where this faculty is in-charge
    let mySections = allSections.filter(s => s.inCharge === facultyName);
    
    // Fallback if no sections assigned to this faculty
    if (mySections.length === 0 && allSections.length > 0) {
      mySections = allSections; // Show all sections as fallback
    }
    
    setSections(mySections);
    if (mySections.length > 0) setSelectedSection(mySections[0].name);
  }, [facultyName]);

  useEffect(() => {
    if (selectedSection) {
      const allUsers = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
      const sectionStudents = allUsers.filter(u => u.role === 'student' && u.section === selectedSection);
      setStudents(sectionStudents);

      // Load existing attendance for today
      const today = new Date().toISOString().split('T')[0];
      const allAttendance = JSON.parse(localStorage.getItem('tt_attendance') || '{}');
      const todayAttendance = allAttendance[today]?.[selectedSection] || {};
      
      const initialAttendance = {};
      sectionStudents.forEach(s => {
        initialAttendance[s.id] = todayAttendance[s.id] || 'present';
      });
      setAttendance(initialAttendance);
    }
  }, [selectedSection]);

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const saveAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const allAttendance = JSON.parse(localStorage.getItem('tt_attendance') || '{}');
    
    if (!allAttendance[today]) allAttendance[today] = {};
    allAttendance[today][selectedSection] = attendance;
    
    localStorage.setItem('tt_attendance', JSON.stringify(allAttendance));
    toast.success('Attendance saved for ' + today);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-500" />
          Attendance Marking
        </h2>
        <div className="flex items-center gap-3">
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            {sections.length === 0 && <option value="">No Sections Assigned</option>}
          </select>
          <button 
            onClick={saveAttendance}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all"
          >
            Save Today
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reg No</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
                  <div className="text-xs text-slate-500">{student.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                  {student.regNo || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => toggleAttendance(student.id)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        attendance[student.id] === 'present'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}
                    >
                      {attendance[student.id] === 'present' ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Present</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> Absent</>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">
                  No students found for this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManager;
