import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        halls: 0,
        exams: 0,
        allocations: 0,
        deptStats: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5001/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
                if (err.response?.status === 403 || err.response?.status === 401) {
                    alert("Session expired. Please log out and log in again.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Admin Command Center</h1>
                <p>Overview of Exam Seating System Status</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-value">{stats.students}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-value">{stats.halls}</div>
                    <div className="stat-label">Exam Halls</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-value">{stats.exams}</div>
                    <div className="stat-label">Active Exams</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-value">{stats.allocations}</div>
                    <div className="stat-label">Total Allocations</div>
                </div>
            </div>

            <div className="dashboard-actions">
                <button className="action-btn" onClick={() => navigate('/students')}>Manage Students</button>
                <button className="action-btn" onClick={() => navigate('/halls')}>Manage Halls</button>
                <button className="action-btn" onClick={() => navigate('/exams')}>Manage Exams</button>
                <button className="action-btn primary" onClick={() => navigate('/allocate')}>Start Seat Allocation</button>
            </div>

            <div className="dept-stats">
                <h3>Students by Department</h3>
                <div className="dept-grid">
                    {stats.deptStats.map((d, i) => (
                        <div key={i} className="dept-tag">
                            {d.department || "General"}: <strong>{d.count}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
