import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Search, Pencil, Trash2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { sectionService } from '../services/api';

const DEMO_SECTIONS = [
  { id: 1, name: 'CSE-A', department: 'Computer Science', year: 2 },
  { id: 2, name: 'CSE-B', department: 'Computer Science', year: 2 },
  { id: 3, name: 'CSE-C', department: 'Computer Science', year: 2 },
  { id: 4, name: 'ECE-A', department: 'Electronics', year: 2 },
];

const COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
];

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', department: 'Computer Science', year: 2, inCharge: '' });
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => { 
    fetchData(); 
    // Fetch faculty for in-charge dropdown
    const users = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
    setFacultyList(users.filter(u => u.role === 'faculty'));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try local storage first to keep custom in-charge assignments
      const stored = JSON.parse(localStorage.getItem('tt_sections') || '[]');
      if (stored.length > 0) {
        setSections(stored);
      } else {
        const res = await sectionService.getAll();
        const data = Array.isArray(res.data) ? res.data : DEMO_SECTIONS;
        setSections(data);
        localStorage.setItem('tt_sections', JSON.stringify(data));
      }
    } catch {
      setSections(DEMO_SECTIONS);
    }
    setLoading(false);
  };

  const filtered = sections.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(search.toLowerCase())) ||
    (s.inCharge && s.inCharge.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditingItem(null); setForm({ name: '', department: 'Computer Science', year: 2, inCharge: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setForm({ name: item.name, department: item.department || '', year: item.year || 2, inCharge: item.inCharge || '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Please enter section name'); return; }
    let updatedSections;
    if (editingItem) {
      updatedSections = sections.map(s => s.id === editingItem.id ? { ...s, ...form } : s);
      toast.success('Section updated');
    } else {
      const newItem = { id: Date.now(), ...form };
      updatedSections = [...sections, newItem];
      toast.success('Section added');
    }
    setSections(updatedSections);
    localStorage.setItem('tt_sections', JSON.stringify(updatedSections));
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this section?')) return;
    const updatedSections = sections.filter(s => s.id !== id);
    setSections(updatedSections);
    localStorage.setItem('tt_sections', JSON.stringify(updatedSections));
    toast.success('Section deleted');
  };

  if (loading) return <Spinner text="Loading sections..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-violet-600" /> Section Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage class sections and batches</p>
        </div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Section
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search sections..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all" />
      </motion.div>

      {/* Cards Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No sections found</div>
        ) : filtered.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
          >
            {/* Gradient header */}
            <div className={`h-2 bg-gradient-to-r ${COLORS[idx % COLORS.length]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center shadow-lg`}>
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{s.department || 'General'}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">Year {s.year}</span>
                        {s.inCharge && (
                            <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-bold border border-violet-100 dark:border-violet-800">In-Charge: {s.inCharge}</span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Section' : 'Add Section'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Section Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. CSE-A"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
              <input type="number" min={1} max={4} value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Faculty In-Charge</label>
            <select value={form.inCharge} onChange={(e) => setForm({ ...form, inCharge: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none">
                <option value="">Select In-Charge</option>
                {facultyList.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md transition-all font-medium">{editingItem ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sections;
