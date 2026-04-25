import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, BookOpen, School, Layers,
  Menu, Sun, Moon, ChevronRight, ClipboardList, LogOut, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('smarttable_dark') === 'true';
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Apply dark mode class on mount and whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smarttable_dark', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDark = () => setIsDarkMode(prev => !prev);

  const adminNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Timetable', path: '/timetable', icon: CalendarDays },
    { name: 'Exam Seating', path: '/exam-seating', icon: ClipboardList },
    { name: 'Faculty', path: '/faculty', icon: Users },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Classrooms', path: '/classrooms', icon: School },
    { name: 'Sections', path: '/sections', icon: Layers },
  ];

  const studentNavItems = [
    { name: 'My Dashboard', path: '/', icon: LayoutDashboard },
  ];

  const facultyNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Exam Seating', path: '/exam-seating', icon: ClipboardList },
  ];

  const navItems = user?.role === 'student'
    ? studentNavItems
    : user?.role === 'faculty'
    ? facultyNavItems
    : adminNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = user?.role === 'admin'
    ? 'from-primary-500 to-primary-700'
    : user?.role === 'faculty'
    ? 'from-violet-500 to-violet-700'
    : 'from-emerald-500 to-emerald-700';

  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <CalendarDays className="text-white w-5 h-5" />
        </div>
        {isSidebarOpen && (
          <span className="ml-3 font-extrabold text-xl dark:text-white tracking-tight whitespace-nowrap">
            Smart<span className="text-primary-600">Table</span>
          </span>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      {user && isSidebarOpen && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}{user.section ? ` · ${user.section}` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-primary-500'}`} />
              {isSidebarOpen && (
                <span className="ml-3 font-semibold text-sm whitespace-nowrap">{item.name}</span>
              )}
              {isActive && isSidebarOpen && (
                <ChevronRight className="w-4 h-4 ml-auto text-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 flex-shrink-0">
        <button
          onClick={toggleDark}
          className="w-full flex items-center px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          {isDarkMode
            ? <Sun className="w-5 h-5 text-amber-500 flex-shrink-0" />
            : <Moon className="w-5 h-5 flex-shrink-0" />}
          {isSidebarOpen && (
            <span className="ml-3 font-semibold text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        <button
          onClick={() => setIsSidebarOpen(p => !p)}
          className="hidden lg:flex w-full items-center px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <Menu className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-semibold text-sm">Collapse</span>}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-semibold text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden transition-colors"
        style={{ minWidth: isSidebarOpen ? 260 : 72 }}
      >
        <Sidebar />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 z-50"
            >
              <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex-shrink-0 h-16 flex items-center px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-extrabold text-lg dark:text-white">
            Smart<span className="text-primary-600">Table</span>
          </span>
          <button onClick={toggleDark} className="ml-auto p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
