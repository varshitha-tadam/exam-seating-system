import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Clock, User, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [seatInfo, setSeatInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('timetable');

  useEffect(() => {
    // Load generated timetable for student's section
    const stored = JSON.parse(localStorage.getItem('tt_generated') || 'null');
    if (stored && user?.section && stored[user.section]) {
      setTimetable(stored[user.section]);
    }

    // Load seat info from exam allocations
    const allocations = JSON.parse(localStorage.getItem('tt_exam_allocations') || 'null');
    if (allocations) {
      for (const [examName, hallData] of Object.entries(allocations)) {
        for (const [hallName, grid] of Object.entries(hallData)) {
          for (const row of grid) {
            for (const cell of row) {
              if (cell && (cell.name === user?.name || cell.regNo === user?.regNo)) {
                setSeatInfo({ exam: examName, hall: hallName, seat: cell.seat, row: cell.seat?.split('C')[0], col: cell.seat?.split('C')[1] });
              }
            }
          }
        }
      }
    }
  }, [user]);

  const getCellStyle = (cell) => {
    if (!cell) return '';
    if (cell.isBreak) return 'bg-slate-100 dark:bg-slate-700';
    if (cell.isLab) return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400';
    if (cell.isFree) return 'bg-slate-50 dark:bg-slate-800';
    return 'bg-white dark:bg-slate-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Section: <span className="font-semibold text-primary-600">{user?.section || 'Not assigned'}</span> &nbsp;·&nbsp; Academic Year 2025-26
        </p>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'My Section', value: user?.section || 'N/A', icon: User, color: 'bg-purple-500' },
          { label: 'Classes Today', value: timetable ? '5' : 'N/A', icon: CalendarDays, color: 'bg-primary-500' },
          { label: 'Upcoming Exams', value: '3', icon: BookOpen, color: 'bg-amber-500' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
        {['timetable', 'exam-seat', 'marks'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
            {tab === 'timetable' ? '📅 My Timetable' : tab === 'exam-seat' ? '🪑 Exam Seat' : '📊 My Marks'}
          </button>
        ))}
      </div>

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {!timetable ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Timetable Not Yet Available</h3>
              <p className="text-slate-400 text-sm">Your admin hasn't generated the timetable yet. Check back soon!</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                  Weekly Schedule — {user?.section}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-primary-600">
                      <th className="px-4 py-3.5 text-left text-white font-semibold text-sm w-32">Time</th>
                      {DAYS.map(d => <th key={d} className="px-4 py-3.5 text-center text-white font-semibold text-sm">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot, si) => (
                      <tr key={slot} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <td className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 whitespace-nowrap">{slot}</td>
                        {DAYS.map((_, di) => {
                          const cell = timetable?.[di]?.[si];
                          return (
                            <td key={di} className={`px-3 py-3 text-center border-l border-slate-100 dark:border-slate-800 ${getCellStyle(cell)}`}>
                              {cell?.isBreak ? (
                                <span className="text-xs font-semibold text-slate-400">☕ Break</span>
                              ) : cell?.isFree ? (
                                <span className="text-xs text-slate-300 dark:text-slate-600">Free</span>
                              ) : cell ? (
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">{cell.subject}</p>
                                  {cell.faculty && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{cell.faculty}</p>}
                                  {cell.room && <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium mt-0.5">{cell.room}</p>}
                                  {cell.isLab && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">LAB</span>}
                                </div>
                              ) : <span className="text-slate-200 dark:text-slate-700">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Exam Seat Tab */}
      {activeTab === 'exam-seat' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {seatInfo ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Exam Seat is Allocated!</h3>
              <div className="mt-6 inline-grid grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Exam</p>
                  <p className="font-bold text-slate-900 dark:text-white">{seatInfo.exam}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Hall</p>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1"><MapPin className="w-4 h-4 text-rose-500" />{seatInfo.hall}</p>
                </div>
                <div className="p-4 bg-primary-600 rounded-xl text-white">
                  <p className="text-xs uppercase font-bold opacity-70 mb-1">Seat No.</p>
                  <p className="font-bold text-xl">{seatInfo.seat}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
              <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Seats Not Yet Allocated</h3>
              <p className="text-slate-400 text-sm">Your faculty or admin will allocate exam seats soon. They will appear here automatically.</p>
            </div>
          )}

          {/* Upcoming Exams */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">📅 Upcoming Exams</h3>
            <div className="space-y-3">
              {[
                { subject: 'Data Structures', date: 'May 15, 2026', time: '10:00 AM', status: 'Confirmed' },
                { subject: 'DBMS', date: 'May 18, 2026', time: '2:00 PM', status: 'Confirmed' },
                { subject: 'Operating Systems', date: 'May 21, 2026', time: '10:00 AM', status: 'Tentative' },
              ].map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{exam.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{exam.date} · {exam.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    exam.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{exam.status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      {/* Marks Tab */}
      {activeTab === 'marks' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-500" />
              Academic Performance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const allMarks = JSON.parse(localStorage.getItem('tt_marks') || '{}');
                const myMarks = [];
                Object.entries(allMarks).forEach(([subject, sections]) => {
                  if (sections[user.section] && sections[user.section][user.id]) {
                    myMarks.push({ subject, score: sections[user.section][user.id] });
                  }
                });

                if (myMarks.length === 0) {
                  return (
                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-slate-400">No marks have been published for you yet.</p>
                    </div>
                  );
                }

                return myMarks.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{m.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-extrabold ${parseInt(m.score) >= 40 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {m.score}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentDashboard;
