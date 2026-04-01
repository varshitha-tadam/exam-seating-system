import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../api';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        department: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_URL}/signup`, formData);
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-card" style={{ background: '#1e293b', padding: '40px', borderRadius: '24px', border: '1px solid #334155', width: '100%', maxWidth: '440px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <div className="nav-brand" style={{ marginBottom: '20px', textAlign: 'center', fontSize: '2rem', color: '#ffffff' }}>ExamSeat</div>
                <h2 style={{ marginBottom: '10px', textAlign: 'center', color: '#ffffff' }}>Create Account</h2>
                
                {error && <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
                
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            name="firstName"
                            placeholder="First Name"
                            required
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                            onChange={handleChange}
                        />
                        <input
                            name="lastName"
                            placeholder="Last Name"
                            required
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                            onChange={handleChange}
                        />
                    </div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                        onChange={handleChange}
                    />
                    <input
                        name="department"
                        placeholder="Department (e.g. CSE)"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff' }}
                        onChange={handleChange}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', marginTop: '10px', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                        {loading ? 'Creating Account...' : 'Continue'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Already have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none' }}>Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;