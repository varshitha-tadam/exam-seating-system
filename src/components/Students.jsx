import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Management.css';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', rollNumber: '', department: '' });
    const [loading, setLoading] = useState(false);

    const fetchStudents = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/students', { headers: { Authorization: `Bearer ${token}` } });
        setStudents(res.data);
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/students', formData, { headers: { Authorization: `Bearer ${token}` } });
            setFormData({ name: '', email: '', rollNumber: '', department: '' });
            fetchStudents();
        } catch (err) { alert(err.response?.data?.message || "Error adding student"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchStudents();
    };

    return (
        <div className="manage-container">
            <h2>Student Management</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
                <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input placeholder="Roll Number" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} required />
                <input placeholder="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
                <button type="submit" disabled={loading}>Add Student</button>
            </form>

            <div className="manage-list">
                {students.map(s => (
                    <div key={s.id} className="manage-card">
                        <div>
                            <strong>{s.name}</strong>
                            <p>{s.rollNumber} | {s.department}</p>
                            <small>{s.email}</small>
                        </div>
                        <button className="del-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Students;
