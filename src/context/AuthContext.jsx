import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('smarttable_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      const userData = { 
        id: found.id, 
        name: found.name, 
        email: found.email, 
        role: found.role, 
        section: found.section,
        regNo: found.regNo 
      };
      setUser(userData);
      localStorage.setItem('smarttable_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const signup = (name, email, password, role = 'student', section = '', regNo = '') => {
    const users = JSON.parse(localStorage.getItem('smarttable_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }
    const newUser = { id: Date.now(), name, email, password, role, section, regNo };
    users.push(newUser);
    localStorage.setItem('smarttable_users', JSON.stringify(users));
    
    const userData = { id: newUser.id, name, email, role, section, regNo };
    setUser(userData);
    localStorage.setItem('smarttable_user', JSON.stringify(userData));
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smarttable_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
