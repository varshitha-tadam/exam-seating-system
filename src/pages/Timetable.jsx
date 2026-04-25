import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Download, ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '9:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 1:00',
  '1:00 - 2:00',
  '2:00 - 3:00',
  '3:00 - 4:00',
];

const Timetable = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [timetableData, setTimetableData] = useState(null);
  const [allTimetables, setAllTimetables] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem('tt_generated') || 'null');
      if (stored && Object.keys(stored).length > 0) {
        setAllTimetables(stored);
        const secs = Object.keys(stored);
        setSections(secs);
        setSelectedSection(secs[0]);
        setTimetableData(stored[secs[0]]);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (allTimetables && selectedSection) {
      setTimetableData(allTimetables[selectedSection] || null);
    }
  }, [selectedSection, allTimetables]);

  const getCellStyle = (cell) => {
    if (!cell) return 'bg-white dark:bg-slate-800';
    if (cell.isBreak) return 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500';
    if (cell.isLab)   return 'bg-blue-50 dark:bg-blue-900/20';
    if (cell.isFiller) return 'bg-amber-50/50 dark:bg-amber-900/10 border-l-2 border-amber-300';
    if (cell.isFree)  return 'bg-slate-50 dark:bg-slate-800/50';
    return 'bg-white dark:bg-slate-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary-600" /> Timetable
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View generated timetable by section</p>
        </div>
        <div className="flex items-center gap-3">
          {sections.length > 0 && (
            <div className="relative">
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer transition-all text-sm">
                {sections.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
          <button onClick={() => toast('PDF export coming soon!', { icon: '📄' })}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium text-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </motion.div>

      {/* Color Legend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-5 text-sm">
        {[
          { label: 'Regular Class', cls: 'bg-white border-2 border-slate-300' },
          { label: 'Lab Session',   cls: 'bg-blue-100 border-2 border-blue-400' },
          { label: 'Break',         cls: 'bg-slate-200 border-2 border-slate-400' },
          { label: 'Free Period',   cls: 'bg-slate-50 border-2 border-slate-200' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-md inline-block ${l.cls}`} />
            <span className="text-slate-600 dark:text-slate-400">{l.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <Spinner text="Loading timetable..." />
      ) : !allTimetables ? (
        /* Not generated yet */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-16 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Timetable Generated Yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
            Go to the Dashboard and click <strong>"Generate Timetable"</strong> to create a conflict-free schedule.
          </p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-primary-500/25">
            Go to Dashboard
          </button>
        </motion.div>
      ) : (
        /* Timetable Grid */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-primary-600 to-primary-700">
                  <th className="px-4 py-4 text-left text-white font-semibold text-sm w-36">Time Slot</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-4 text-center text-white font-semibold text-sm">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, slotIdx) => (
                  <tr key={slot} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <td className="px-4 py-3 font-medium text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap">
                      {slot}
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      // timetableData[dayIdx][slotIdx]
                      const cell = timetableData?.[dayIdx]?.[slotIdx];
                      return (
                        <td key={dayIdx} className={`px-3 py-3 text-center border-l border-slate-100 dark:border-slate-700 transition-colors ${getCellStyle(cell)}`}>
                          {cell ? (
                            cell.isBreak ? (
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">☕ Break</span>
                            ) : cell.isFree ? (
                              <span className="text-xs text-slate-300 dark:text-slate-600">Free</span>
                            ) : (
                              <div className="space-y-0.5">
                                <p className={`font-semibold text-sm leading-tight ${cell.isFiller ? 'text-amber-700 dark:text-amber-400 italic' : 'text-slate-900 dark:text-white'}`}>
                                  {cell.subject}
                                </p>
                                {cell.faculty && <p className="text-xs text-slate-500 dark:text-slate-400">{cell.faculty}</p>}
                                {cell.room    && <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{cell.room}</p>}
                                {cell.isLab   && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">LAB</span>}
                                {cell.isFiller && <span className="text-[9px] text-amber-500 font-bold uppercase">Activity</span>}
                              </div>
                            )
                          ) : (
                            <span className="text-slate-200 dark:text-slate-700">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Timetable;
