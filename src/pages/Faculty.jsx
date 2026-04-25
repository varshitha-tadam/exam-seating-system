import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { facultyService } from '../services/api';

const DEMO_FACULTY = [
  { id: 1, name: 'Dr. Kumar', subject: 'Data Structures' },
  { id: 2, name: 'Prof. Singh', subject: 'DBMS' },
  { id: 3, name: 'Dr. Patel', subject: 'Operating Systems' },
  { id: 4, name: 'Dr. Reddy', subject: 'Computer Networks' },
  { id: 5, name: 'Dr. Rao', subject: 'Mathematics' },
  { id: 6, name: 'Prof. Sharma', subject: 'English' },
];

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', subject: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await facultyService.getAll();
      setFaculty(Array.isArray(res.data) ? res.data : DEMO_FACULTY);
    } catch {
      setFaculty(DEMO_FACULTY);
    }
    setLoading(false);
  };

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.subject.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditingItem(null); setForm({ name: '', subject: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setForm({ name: item.name, subject: item.subject }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim()) { toast.error('Please fill all fields'); return; }
    try {
      if (editingItem) {
        await facultyService.update(editingItem.id, form);
        setFaculty(prev => prev.map(f => f.id === editingItem.id ? { ...f, ...form } : f));
        toast.success('Faculty updated successfully');
      } else {
        const res = await facultyService.create(form);
        const newItem = res.data || { id: Date.now(), ...form };
        setFaculty(prev => [...prev, newItem]);
        toast.success('Faculty added successfully');
      }
    } catch {
      if (editingItem) {
        setFaculty(prev => prev.map(f => f.id === editingItem.id ? { ...f, ...form } : f));
        toast.success('Faculty updated (local)');
      } else {
        setFaculty(prev => [...prev, { id: Date.now(), ...form }]);
        toast.success('Faculty added (local)');
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    try { await facultyService.remove(id); } catch { /* local fallback */ }
    setFaculty(prev => prev.filter(f => f.id !== id));
    toast.success('Faculty deleted');
  };

  if (loading) return <Spinner text="Loading faculty..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" /> Faculty Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage faculty members and their subjects</p>
        </div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Faculty
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No faculty found</td></tr>
              ) : filtered.map((f, idx) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">{f.name.charAt(0)}</div>
                      <span className="font-medium text-slate-900 dark:text-white">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{f.subject}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(f)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Faculty' : 'Add Faculty'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Kumar"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all font-medium">{editingItem ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Faculty;
