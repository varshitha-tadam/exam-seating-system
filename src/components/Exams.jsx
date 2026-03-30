import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Management.css';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [halls, setHalls] = useState([]);
    const [formData, setFormData] = useState({ name: '', subject: '', date: '', time: '', hall_id: '' });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const [exRes, hlRes] = await Promise.all([
            axios.get('http://localhost:5001/exams', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5001/halls', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setExams(exRes.data);
        setHalls(hlRes.data);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/exams', formData, { headers: { Authorization: `Bearer ${token}` } });
            setFormData({ name: '', subject: '', date: '', time: '', hall_id: '' });
            fetchData();
        } catch (err) { alert("Error scheduling exam"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this exam?")) return;
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/exams/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
    };

    return (
        <div className="manage-container">
            <h2>Schedule Exams</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
                <input placeholder="Exam Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                <input placeholder="Time (e.g. 10:00 AM)" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
                <select value={formData.hall_id} onChange={e => setFormData({...formData, hall_id: e.target.value})} required>
                    <option value="">Select Hall</option>
                    {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                <button type="submit" disabled={loading}>Schedule</button>
            </form>

            <div className="manage-list">
                {exams.map(ex => (
                    <div key={ex.id} className="manage-card">
                        <div>
                            <strong>{ex.name}</strong>
                            <p>{ex.subject} | {ex.date} | {ex.time}</p>
                            <small>Hall: {ex.hall_name || 'N/A'}</small>
                        </div>
                        <button className="del-btn" onClick={() => handleDelete(ex.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Exams;
