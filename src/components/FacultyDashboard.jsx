import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, MapPin, ClipboardList, CheckCircle, Bell, ChevronRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from './StatCard';
import AttendanceManager from './AttendanceManager';
import MarksManager from './MarksManager';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [examDuties, setExamDuties] = useState([
    { id: 1, subject: 'Data Structures', date: 'May 15, 2026', time: '10:00 AM - 1:00 PM', room: 'Hall A', students: 45 },
    { id: 2, subject: 'DBMS', date: 'May 18, 2026', time: '2:00 PM - 5:00 PM', room: 'Hall C', students: 30 },
  ]);

  const [classesToday, setClassesToday] = useState([
    { id: 1, subject: 'Data Structures', time: '9:00 - 10:00 AM', room: 'R101', section: 'CSE-A' },
    { id: 2, subject: 'Lab: OS', time: '1:00 - 4:00 PM', room: 'Lab-1', section: 'CSE-B' },
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Welcome, {user.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your teaching and invigilation workspace.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {['schedule', 'attendance', 'marks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'schedule' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Classes Today" value={classesToday.length} icon={Clock} color="blue" delay={0} />
            <StatCard title="Exam Duties" value={examDuties.length} icon={ClipboardList} color="rose" delay={1} />
            <StatCard title="Total Students" value={75} icon={User} color="emerald" delay={2} />
            <StatCard title="Subjects" value={2} icon={BookOpen} color="violet" delay={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Exam Duties Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-rose-500" />
                  Exam Invigilation Duty
                </h2>
                <span className="text-sm font-semibold text-rose-500">Upcoming</span>
              </div>

              <div className="space-y-6">
                {examDuties.map((duty, i) => (
                  <motion.div 
                    key={duty.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg dark:text-white">{duty.subject}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" /> {duty.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                            <Clock className="w-4 h-4" /> {duty.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <MapPin className="w-5 h-5 text-rose-500" />
                        <span className="font-bold dark:text-white">{duty.room}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Classes Today Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary-500" />
                  Schedule for Today
                </h2>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {classesToday.map((item, i) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-slate-900 z-10" />
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold dark:text-white">{item.subject}</h4>
                        <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-[10px] font-bold uppercase">{item.section}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {item.time}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {item.room}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'attendance' && <AttendanceManager facultyName={user.name} />}
      {activeTab === 'marks' && <MarksManager facultyName={user.name} />}
    </div>
  );
};

export default FacultyDashboard;
