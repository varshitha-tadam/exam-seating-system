import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, School, Layers, Sparkles, CheckCircle2, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatCard from './StatCard';
import Spinner from './Spinner';
import { generateTimetable } from '../utils/timetableGenerator';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [stats, setStats] = useState({ sections: 4, subjects: 8, faculty: 6, classrooms: 5 });
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for counts
    setTimeout(() => {
      const s = JSON.parse(localStorage.getItem('tt_sections') || '[]');
      const sb = JSON.parse(localStorage.getItem('tt_subjects') || '[]');
      const f = JSON.parse(localStorage.getItem('tt_faculty') || '[]');
      const c = JSON.parse(localStorage.getItem('tt_classrooms') || '[]');
      
      setStats({
        sections: s.length || 4,
        subjects: sb.length || 8,
        faculty: f.length || 6,
        classrooms: c.length || 5
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);

    setTimeout(() => {
      // In a real app, we'd fetch all data then generate
      const s = JSON.parse(localStorage.getItem('tt_sections') || '[]');
      const sb = JSON.parse(localStorage.getItem('tt_subjects') || '[]');
      const f = JSON.parse(localStorage.getItem('tt_faculty') || '[]');
      const c = JSON.parse(localStorage.getItem('tt_classrooms') || '[]');
      
      // Fallback to demo data if empty
      const sections = s.length ? s : [{name: 'Section A'}, {name: 'Section B'}, {name: 'Section C'}];
      const subjects = sb.length ? sb : [
        {name: 'Software Engineering', hoursPerWeek: 5},
        {name: 'DBMS', hoursPerWeek: 5},
        {name: 'Data Structures', hoursPerWeek: 5},
        {name: 'Computer Networks', hoursPerWeek: 5},
        {name: 'Operating Systems', hoursPerWeek: 5}
      ];
      const faculty = f.length ? f : [
        {name: 'Prof. Rao', subject: 'Software Engineering'},
        {name: 'Dr. Sharma', subject: 'DBMS'},
        {name: 'Dr. Kumar', subject: 'Data Structures'},
        {name: 'Dr. Reddy', subject: 'Computer Networks'},
        {name: 'Prof. Verma', subject: 'Operating Systems'}
      ];
      const classrooms = c.length ? c : [{roomNumber: 'R101'}, {roomNumber: 'R102'}, {roomNumber: 'R103'}];

      try {
        const timetables = generateTimetable(sections, subjects, faculty, classrooms);
        localStorage.setItem('tt_generated', JSON.stringify(timetables));
        setGenerated(true);
        toast.success(`Conflict-free timetable generated!`);
      } catch (err) {
        toast.error('Generation failed. Check data consistency.');
      }
      setGenerating(false);
    }, 2000);
  };

  if (loading) return <Spinner text="Loading Admin Dashboard..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Admin Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage institutional resources and scheduling.</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
             System Online
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Sections" value={stats.sections} icon={Layers} color="purple" delay={0} />
        <StatCard title="Total Subjects" value={stats.subjects} icon={BookOpen} color="blue" delay={1} />
        <StatCard title="Faculty Pool" value={stats.faculty} icon={Users} color="green" delay={2} />
        <StatCard title="Exam Halls" value={stats.classrooms} icon={School} color="orange" delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">Timetable Engine</h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                Our intelligent algorithm will distribute subjects, labs, and faculty across the weekly schedule ensuring zero conflicts and optimized classroom usage.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {generating ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate Schedules</>
                  )}
                </button>
                
                {generated && (
                  <button 
                    onClick={() => navigate('/timetable')}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CalendarDays className="w-5 h-5" /> View Timetables
                  </button>
                )}
              </div>

              {generated && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> All schedules updated in real-time.
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" /> Quick Tasks
            </h3>
            <div className="space-y-3">
                {[
                  { title: 'Manage Users', icon: Users, path: '/users', color: 'text-indigo-500' },
                  { title: 'Allocate Exam Seats', icon: School, path: '/exam-seating', color: 'text-orange-500' },
                  { title: 'Update Faculty List', icon: Users, path: '/faculty', color: 'text-green-500' },
                  { title: 'Manage Sections', icon: Layers, path: '/sections', color: 'text-purple-500' },
                ].map((task, i) => (
                <div key={i} onClick={() => navigate(task.path)} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <task.icon className={`w-5 h-5 ${task.color}`} />
                    <span className="font-semibold text-sm dark:text-slate-300">{task.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold">Pro Tip</h3>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed">
              Ensure you have at least one classroom marked as 'Lab' to enable automatic lab scheduling in the timetable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default AdminDashboard;
