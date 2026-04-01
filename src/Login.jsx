import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from './api';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/login`, credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/'; // Force reload to refresh App state
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-card" style={{ background: '#1e293b', padding: '40px', borderRadius: '24px', border: '1px solid #334155', width: '100%', maxWidth: '440px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                
                {/* Icon */}
                <div style={{ background: '#3b82f6', borderRadius: '15px', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto' }}>
                    <span style={{ fontSize: '1.8rem' }}>🎓</span>
                </div>

                <h1 style={{ marginBottom: '8px', textAlign: 'center', color: '#ffffff', fontSize: '2.2rem', fontWeight: '800' }}>ExamSeat Login</h1>
                <p style={{ marginBottom: '35px', textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>Secure Exam Management System</p>
                
                {error && (
                    <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '25px', fontSize: '1rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="faculty@examseat.com"
                            required
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                            onChange={handleChange}
                            value={credentials.email}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                            onChange={handleChange}
                            value={credentials.password}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', marginTop: '10px', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>
                
                <div style={{ borderTop: '1px solid #334155', marginTop: '30px', paddingTop: '20px' }}>
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Demo Access:</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button 
                            onClick={() => setCredentials({ email: 'admin@examseat.com', password: 'Admin@2024!' })}
                            style={{ background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Admin
                        </button>
                        <button 
                            onClick={() => setCredentials({ email: 'faculty@examseat.com', password: 'Faculty@2024!' })}
                            style={{ background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Faculty
                        </button>
                    </div>
                </div>

                <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '1rem', color: '#94a3b8' }}>
                    New to the system? <Link to="/register" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none' }}>Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;