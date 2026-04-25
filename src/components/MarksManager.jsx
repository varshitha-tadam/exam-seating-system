import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, User, Award, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const MarksManager = ({ facultyName }) => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    // Load sections
    const allSections = JSON.parse(localStorage.getItem('tt_sections') || '[]');
    setSections(allSections);
    if (allSections.length > 0) setSelectedSection(allSections[0].name);

    // Load subjects for this faculty
    const storedSubjects = JSON.parse(localStorage.getItem('tt_subjects') || '[]');
    const finalSubjects = storedSubjects.length > 0 ? storedSubjects : [
      { id: 1, name: 'Data Structures' },
      { id: 2, name: 'DBMS' },
      { id: 3, name: 'Operating Systems' }
    ];
    setSubjects(finalSubjects);
    if (finalSubjects.length > 0) setSelectedSubject(finalSubjects[0].name);
  }, []);

  useEffect(() => {
    if (selectedSection && selectedSubject) {
      const allUsers = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
      const sectionStudents = allUsers.filter(u => u.role === 'student' && u.section === selectedSection);
      setStudents(sectionStudents);

      // Load existing marks
      const allMarks = JSON.parse(localStorage.getItem('tt_marks') || '{}');
      const subMarks = allMarks[selectedSubject]?.[selectedSection] || {};
      
      const initialMarks = {};
      sectionStudents.forEach(s => {
        initialMarks[s.id] = subMarks[s.id] || '';
      });
      setMarks(initialMarks);
    }
  }, [selectedSection, selectedSubject]);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const saveMarks = () => {
    const allMarks = JSON.parse(localStorage.getItem('tt_marks') || '{}');
    
    if (!allMarks[selectedSubject]) allMarks[selectedSubject] = {};
    allMarks[selectedSubject][selectedSection] = marks;
    
    localStorage.setItem('tt_marks', JSON.stringify(allMarks));
    toast.success(`Marks saved for ${selectedSubject} (${selectedSection})`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Student Performance Entry
          </h2>
          <p className="text-sm text-slate-500 mt-1">Select class and subject to fill student marks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Section</span>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none min-w-[120px]"
            >
              {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Subject</span>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none min-w-[160px]"
            >
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <button 
            onClick={saveMarks}
            className="mt-4 lg:mt-0 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-end"
          >
            <Save className="w-4 h-4" /> Save Marks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{student.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{student.regNo || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="0"
                max="100"
                value={marks[student.id]}
                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                placeholder="0"
                className="w-16 px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 italic">
            No students found in this section.
          </div>
        )}
      </div>
    </div>
  );
};

export default MarksManager;
