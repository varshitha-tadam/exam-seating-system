import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import './Management.css';

const Halls = () => {
    const [halls, setHalls] = useState([]);
    const [formData, setFormData] = useState({ name: '', capacity: '', rows: '', cols: '' });
    const [loading, setLoading] = useState(false);

    const fetchHalls = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/halls`, { headers: { Authorization: `Bearer ${token}` } });
        setHalls(res.data);
    };

    useEffect(() => { fetchHalls(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/halls`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setFormData({ name: '', capacity: '', rows: '', cols: '' });
            fetchHalls();
        } catch (err) { alert("Error adding hall"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this hall?")) return;
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/halls/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchHalls();
    };

    return (
        <div className="manage-container">
            <h2>Manage Exam Halls</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
                <input placeholder="Hall Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Total Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
                <input placeholder="Rows" type="number" value={formData.rows} onChange={e => setFormData({...formData, rows: e.target.value})} required />
                <input placeholder="Cols" type="number" value={formData.cols} onChange={e => setFormData({...formData, cols: e.target.value})} required />
                <button type="submit" disabled={loading}>Add Hall</button>
            </form>

            <div className="manage-list">
                {halls.map(h => (
                    <div key={h.id} className="manage-card">
                        <div>
                            <strong>{h.name}</strong>
                            <p>Cap: {h.capacity} | Grid: {h.rows}x{h.cols}</p>
                        </div>
                        <button className="del-btn" onClick={() => handleDelete(h.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Halls;
