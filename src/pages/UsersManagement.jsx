import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, User, GraduationCap, UserCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', section: '', regNo: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    const storedUsers = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
    setUsers(storedUsers);
    setLoading(false);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      role: user.role || 'student',
      section: user.section || '',
      regNo: user.regNo || ''
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const updatedUsers = users.map(u => 
      u.email === editingUser.email ? { ...u, ...form } : u
    );
    localStorage.setItem('smarttable_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast.success(`Role updated for ${form.name}`);
    setModalOpen(false);
  };

  const handleDelete = (email) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const updatedUsers = users.filter(u => u.email !== email);
    localStorage.setItem('smarttable_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast.success('User deleted');
  };

  if (loading) return <Spinner text="Loading Users..." />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" /> User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Assign roles and manage access for all registered users</p>
        </div>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search by name, email or role..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Details</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${
                        user.role === 'admin' ? 'from-rose-500 to-orange-500' :
                        user.role === 'faculty' ? 'from-emerald-500 to-teal-500' :
                        'from-blue-500 to-indigo-500'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      user.role === 'faculty' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.role || 'student'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'student' ? (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <div className="font-semibold">{user.section || 'No Section'}</div>
                        <div>{user.regNo || 'No Reg No'}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not Applicable</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.email)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Manage User Access">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign Role</label>
            <select 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {form.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Section</label>
                <input 
                  type="text" 
                  value={form.section} 
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  placeholder="e.g. CSE-A"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reg No</label>
                <input 
                  type="text" 
                  value={form.regNo} 
                  onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                  placeholder="e.g. 2023CS001"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-all">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold transition-all">Update Access</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagement;
