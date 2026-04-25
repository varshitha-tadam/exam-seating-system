import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, RotateCcw, Users, CheckCircle, XCircle, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_EXAMS = [
  { id: 1, name: 'Data Structures - May 15', date: 'May 15, 2026', time: '10:00 AM – 1:00 PM' },
  { id: 2, name: 'DBMS - May 18', date: 'May 18, 2026', time: '2:00 PM – 5:00 PM' },
  { id: 3, name: 'Operating Systems - May 21', date: 'May 21, 2026', time: '10:00 AM – 1:00 PM' },
];

const DEMO_HALLS = [
  { id: 1, name: 'Hall A', capacity: 30 },
  { id: 2, name: 'Hall B', capacity: 30 },
  { id: 3, name: 'Hall C', capacity: 20 },
];

const DEMO_STUDENTS = [
  { id: 1, regNo: '21CS101', name: 'Rahul Kumar', section: 'CSE-A' },
  { id: 2, regNo: '21CS102', name: 'Priya Sharma', section: 'CSE-A' },
  { id: 3, regNo: '21CS103', name: 'Amit Patel', section: 'CSE-A' },
  { id: 4, regNo: '21CS104', name: 'Sneha Reddy', section: 'CSE-A' },
  { id: 5, regNo: '21CS105', name: 'Vikram Singh', section: 'CSE-A' },
  { id: 6, regNo: '21CS106', name: 'Ananya Gupta', section: 'CSE-A' },
  { id: 7, regNo: '21CS201', name: 'Ravi Teja', section: 'CSE-B' },
  { id: 8, regNo: '21CS202', name: 'Kavya Nair', section: 'CSE-B' },
  { id: 9, regNo: '21CS203', name: 'Arjun Das', section: 'CSE-B' },
  { id: 10, regNo: '21CS204', name: 'Meera Joshi', section: 'CSE-B' },
  { id: 11, regNo: '21CS205', name: 'Sanjay Rao', section: 'CSE-B' },
  { id: 12, regNo: '21CS206', name: 'Deepa Mohan', section: 'CSE-B' },
  { id: 13, regNo: '21EC101', name: 'Suresh Babu', section: 'ECE-A' },
  { id: 14, regNo: '21EC102', name: 'Lakshmi Devi', section: 'ECE-A' },
  { id: 15, regNo: '21EC103', name: 'Karthik Raj', section: 'ECE-A' },
  { id: 16, regNo: '21EC104', name: 'Divya Sri', section: 'ECE-A' },
];

const ExamSeating = () => {
  const [exams] = useState(DEMO_EXAMS);
  const [halls, setHalls] = useState(DEMO_HALLS);
  const [students] = useState(DEMO_STUDENTS);

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [arrangement, setArrangement] = useState('sequential');
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [activeTab, setActiveTab] = useState('');
  const [allocations, setAllocations] = useState({});
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Grid stats for selected hall
  const currentGrid = allocations[selectedExam]?.[selectedHall] || null;
  const flatSeats = currentGrid ? currentGrid.flat() : [];
  const totalSeats = flatSeats.length;
  const occupied = flatSeats.filter(Boolean).length;
  const available = totalSeats - occupied;
  const occupancy = totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0;

  const handleAutoAllocate = () => {
    if (!selectedExam) { toast.error('Select an exam first'); return; }
    if (!selectedHall) { toast.error('Select a hall first'); return; }
    if (!rows || !cols) { toast.error('Set rows and columns'); return; }

    const hall = halls.find(h => h.name === selectedHall);
    if (!hall) return;

    const r = parseInt(rows);
    const c = parseInt(cols);
    if (isNaN(r) || isNaN(c) || r <= 0 || c <= 0) { toast.error('Invalid rows/cols'); return; }

    // Interleave students by section
    const sections = [...new Set(students.map(s => s.section))];
    const bySection = {};
    sections.forEach(sec => {
      bySection[sec] = [...students.filter(s => s.section === sec)];
      if (arrangement === 'random') bySection[sec].sort(() => Math.random() - 0.5);
    });

    const interleaved = [];
    const maxLen = Math.max(...Object.values(bySection).map(a => a.length));
    for (let i = 0; i < maxLen; i++) {
      for (const sec of sections) {
        if (bySection[sec][i]) interleaved.push(bySection[sec][i]);
      }
    }

    const grid = [];
    let idx = 0;
    for (let ri = 0; ri < r; ri++) {
      const row = [];
      for (let ci = 0; ci < c; ci++) {
        row.push(idx < interleaved.length
          ? { ...interleaved[idx++], seat: `R${ri + 1}C${ci + 1}` }
          : null);
      }
      grid.push(row);
    }

    setAllocations(prev => ({
      ...prev,
      [selectedExam]: { ...(prev[selectedExam] || {}), [selectedHall]: grid }
    }));

    // Save to localStorage for student dashboard to read
    const updated = {
      ...(JSON.parse(localStorage.getItem('tt_exam_allocations') || '{}')),
      [selectedExam]: { ...(allocations[selectedExam] || {}), [selectedHall]: grid }
    };
    localStorage.setItem('tt_exam_allocations', JSON.stringify(updated));

    setActiveTab(selectedHall);
    toast.success(`Auto-allocated ${Math.min(interleaved.length, r * c)} students to ${selectedHall}!`);
  };

  const handleReset = () => {
    if (!selectedExam || !selectedHall) return;
    setAllocations(prev => {
      const updated = { ...prev };
      if (updated[selectedExam]) {
        delete updated[selectedExam][selectedHall];
      }
      return updated;
    });
    toast('Allocation cleared.', { icon: '🗑️' });
  };

  // Section color map
  const sectionColors = {
    'CSE-A': { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    'CSE-B': { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    'ECE-A': { bg: 'bg-violet-500', light: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
    'ECE-B': { bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  };

  const getSectionColor = (section) => sectionColors[section] || { bg: 'bg-slate-500', light: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700', dot: 'bg-slate-400' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <LayoutGrid className="w-8 h-8 text-primary-600" /> Exam Seating Allocation
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Auto-allocate seats with mixed-section arrangement to prevent copying.</p>
      </motion.div>

      {/* Configuration Panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl">
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-400" /> Allocation Configuration
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Select Exam */}
          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Exam</label>
            <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer text-sm">
              <option value="">Choose Exam</option>
              {exams.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
            </select>
          </div>

          {/* Select Hall */}
          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Hall</label>
            <select value={selectedHall} onChange={e => setSelectedHall(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer text-sm">
              <option value="">Choose Hall</option>
              {halls.map(h => <option key={h.id} value={h.name}>{h.name} (cap: {h.capacity})</option>)}
            </select>
          </div>

          {/* Arrangement */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Arrangement</label>
            <select value={arrangement} onChange={e => setArrangement(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer text-sm">
              <option value="sequential">Sequential</option>
              <option value="random">Random</option>
            </select>
          </div>

          {/* Rows & Cols */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Rows</label>
              <input type="number" min={1} max={20} value={rows || ''} onChange={e => setRows(e.target.value)} placeholder="0"
                className="w-full px-3 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm text-center" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Cols</label>
              <input type="number" min={1} max={20} value={cols || ''} onChange={e => setCols(e.target.value)} placeholder="0"
                className="w-full px-3 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm text-center" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button onClick={handleAutoAllocate}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary-500/30">
            <Zap className="w-5 h-5" /> Auto-Allocate
          </button>
          <button onClick={handleReset}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl flex items-center gap-2 transition-all">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Seats', value: totalSeats, icon: LayoutGrid, color: 'text-slate-900 dark:text-white' },
          { label: 'Occupied', value: occupied, icon: CheckCircle, color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Available', value: available, icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Occupancy', value: `${occupancy}%`, icon: null, color: 'text-amber-600 dark:text-amber-400' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{card.label}</p>
            <div className="flex items-center gap-3">
              {card.icon && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 1 ? 'bg-primary-100 dark:bg-primary-900/30' : i === 2 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              )}
              <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hall Tabs & Grid */}
      {Object.keys(allocations).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary-600" /> Interactive Seating Grid
            </h3>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold pb-3 sm:pb-0">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600" /> Available</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary-500" /> Occupied</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500" /> Blocked</div>
            </div>
          </div>

          {/* Exam Tabs */}
          {Object.keys(allocations).map(examName => (
            <div key={examName}>
              <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{examName}</p>
                <div className="flex gap-2 overflow-x-auto pb-0">
                  {Object.keys(allocations[examName]).map(hallName => (
                    <button
                      key={hallName}
                      onClick={() => { setActiveTab(hallName); setSelectedExam(examName); }}
                      className={`px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                        activeTab === hallName && selectedExam === examName
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-primary-500'
                          : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {hallName}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab && allocations[selectedExam]?.[activeTab] && selectedExam === examName && (
                <div className="p-6">
                  {/* Front indicator */}
                  <div className="mb-6 text-center">
                    <span className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-lg uppercase tracking-widest">
                      Instructor Area / Screen
                    </span>
                  </div>

                  {/* Section legend */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {[...new Set(allocations[selectedExam][activeTab].flat().filter(Boolean).map(s => s.section))].map(sec => {
                      const color = getSectionColor(sec);
                      return (
                        <div key={sec} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${color.light}`}>
                          <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                          <span className={`text-xs font-bold ${color.text}`}>{sec}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid */}
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      {allocations[selectedExam][activeTab].map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-2 mb-2 items-center">
                          <span className="text-xs text-slate-400 dark:text-slate-500 w-6 text-right flex-shrink-0">{rIdx + 1}</span>
                          {row.map((cell, cIdx) => {
                            const color = cell ? getSectionColor(cell.section) : null;
                            return (
                              <div
                                key={cIdx}
                                onMouseEnter={() => setHoveredSeat(cell)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                className={`relative w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  cell
                                    ? `${color.light} border-transparent hover:scale-110 hover:shadow-lg`
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                }`}
                              >
                                {cell ? (
                                  <>
                                    <div className={`w-5 h-5 rounded-full ${color.bg} mb-0.5`} />
                                    <p className={`text-[9px] font-bold ${color.text} text-center leading-tight truncate w-full px-0.5`}>{cell.regNo}</p>
                                  </>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hover tooltip */}
                  {hoveredSeat && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl max-w-xs border border-slate-700">
                      <p className="font-bold">{hoveredSeat.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{hoveredSeat.regNo} · {hoveredSeat.section}</p>
                      <p className="text-xs text-primary-400 mt-0.5">Seat: {hoveredSeat.seat}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Halls Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-500" /> Exam Halls Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {halls.map(hall => (
            <div key={hall.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{hall.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Capacity: {hall.capacity} seats</p>
                </div>
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              {/* Show allocation status */}
              {selectedExam && allocations[selectedExam]?.[hall.name] ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> Allocated for selected exam
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <XCircle className="w-4 h-4" /> Not allocated yet
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ExamSeating;
