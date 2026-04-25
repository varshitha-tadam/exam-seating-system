import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Pencil, Trash2, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { subjectService } from '../services/api';

const DEMO_SUBJECTS = [
  { id: 1, name: 'Data Structures', hoursPerWeek: 5, isLab: false },
  { id: 2, name: 'DBMS', hoursPerWeek: 4, isLab: false },
  { id: 3, name: 'Operating Systems', hoursPerWeek: 4, isLab: false },
  { id: 4, name: 'Computer Networks', hoursPerWeek: 4, isLab: false },
  { id: 5, name: 'Mathematics', hoursPerWeek: 5, isLab: false },
  { id: 6, name: 'OS Lab', hoursPerWeek: 3, isLab: true },
  { id: 7, name: 'CN Lab', hoursPerWeek: 3, isLab: true },
  { id: 8, name: 'DBMS Lab', hoursPerWeek: 3, isLab: true },
];

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', hoursPerWeek: 4, isLab: false });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await subjectService.getAll();
      setSubjects(Array.isArray(res.data) ? res.data : DEMO_SUBJECTS);
    } catch {
      setSubjects(DEMO_SUBJECTS);
    }
    setLoading(false);
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditingItem(null); setForm({ name: '', hoursPerWeek: 4, isLab: false }); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setForm({ name: item.name, hoursPerWeek: item.hoursPerWeek, isLab: item.isLab }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Please enter subject name'); return; }
    try {
      if (editingItem) {
        await subjectService.update(editingItem.id, form);
        setSubjects(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...form } : s));
        toast.success('Subject updated');
      } else {
        const res = await subjectService.create(form);
        const newItem = res.data || { id: Date.now(), ...form };
        setSubjects(prev => [...prev, newItem]);
        toast.success('Subject added');
      }
    } catch {
      if (editingItem) {
        setSubjects(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...form } : s));
        toast.success('Subject updated (local)');
      } else {
        setSubjects(prev => [...prev, { id: Date.now(), ...form }]);
        toast.success('Subject added (local)');
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try { await subjectService.remove(id); } catch {}
    setSubjects(prev => prev.filter(s => s.id !== id));
    toast.success('Subject deleted');
  };

  if (loading) return <Spinner text="Loading subjects..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" /> Subject Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage subjects and lab courses</p>
        </div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Subject
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
      </motion.div>

      {/* Cards Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No subjects found</div>
        ) : filtered.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group ${s.isLab ? 'border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                  {s.isLab && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                      <FlaskConical className="w-3 h-3" /> Lab
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.hoursPerWeek} hours/week</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Subject' : 'Add Subject'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Hours Per Week</label>
            <input type="number" min={1} max={10} value={form.hoursPerWeek} onChange={(e) => setForm({ ...form, hoursPerWeek: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isLab: !form.isLab })}
              className={`relative w-12 h-7 rounded-full transition-colors ${form.isLab ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.isLab ? 'translate-x-5' : ''}`} />
            </button>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lab Course</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all font-medium">{editingItem ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subjects;
