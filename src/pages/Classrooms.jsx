import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { School, Plus, Search, Pencil, Trash2, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { classroomService } from '../services/api';

const DEMO_CLASSROOMS = [
  { id: 1, roomNumber: 'R101', capacity: 60 },
  { id: 2, roomNumber: 'R102', capacity: 60 },
  { id: 3, roomNumber: 'R103', capacity: 50 },
  { id: 4, roomNumber: 'R104', capacity: 45 },
  { id: 5, roomNumber: 'R105', capacity: 55 },
  { id: 6, roomNumber: 'Lab-1', capacity: 30 },
  { id: 7, roomNumber: 'Lab-2', capacity: 30 },
  { id: 8, roomNumber: 'Lab-3', capacity: 35 },
];

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', capacity: 60 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await classroomService.getAll();
      setClassrooms(Array.isArray(res.data) ? res.data : DEMO_CLASSROOMS);
    } catch {
      setClassrooms(DEMO_CLASSROOMS);
    }
    setLoading(false);
  };

  const filtered = classrooms.filter(c =>
    c.roomNumber.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditingItem(null); setForm({ roomNumber: '', capacity: 60 }); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setForm({ roomNumber: item.roomNumber, capacity: item.capacity }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.roomNumber.trim()) { toast.error('Please enter room number'); return; }
    try {
      if (editingItem) {
        await classroomService.update(editingItem.id, form);
        setClassrooms(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...form } : c));
        toast.success('Classroom updated');
      } else {
        const res = await classroomService.create(form);
        const newItem = res.data || { id: Date.now(), ...form };
        setClassrooms(prev => [...prev, newItem]);
        toast.success('Classroom added');
      }
    } catch {
      if (editingItem) {
        setClassrooms(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...form } : c));
        toast.success('Classroom updated (local)');
      } else {
        setClassrooms(prev => [...prev, { id: Date.now(), ...form }]);
        toast.success('Classroom added (local)');
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this classroom?')) return;
    try { await classroomService.remove(id); } catch {}
    setClassrooms(prev => prev.filter(c => c.id !== id));
    toast.success('Classroom deleted');
  };

  if (loading) return <Spinner text="Loading classrooms..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <School className="w-8 h-8 text-orange-600" /> Classroom Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage rooms and lab facilities</p>
        </div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Classroom
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search classrooms..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" />
      </motion.div>

      {/* Cards Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No classrooms found</div>
        ) : filtered.map((c, idx) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.roomNumber.toLowerCase().includes('lab') ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                <School className={`w-6 h-6 ${c.roomNumber.toLowerCase().includes('lab') ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{c.roomNumber}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <UsersRound className="w-4 h-4" />
              <span>Capacity: {c.capacity}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Classroom' : 'Add Classroom'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Number</label>
            <input type="text" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. R101 or Lab-1"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Capacity</label>
            <input type="number" min={1} max={200} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md transition-all font-medium">{editingItem ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Classrooms;
