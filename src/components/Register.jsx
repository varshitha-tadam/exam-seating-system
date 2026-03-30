import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
            await axios.post('http://localhost:5001/signup', formData);
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="nav-brand" style={{ marginBottom: '20px', textAlign: 'center', fontSize: '2rem' }}>ExamSeat</div>
                <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Create Account</h2>
                
                {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
                
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            name="firstName"
                            placeholder="First Name"
                            required
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                            onChange={handleChange}
                        />
                        <input
                            name="lastName"
                            placeholder="Last Name"
                            required
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                            onChange={handleChange}
                        />
                    </div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        onChange={handleChange}
                    />
                    <input
                        name="department"
                        placeholder="Department (e.g. CSE)"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        onChange={handleChange}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="action-btn primary" 
                        style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                    >
                        {loading ? 'Creating Account...' : 'Continue'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600' }}>Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;