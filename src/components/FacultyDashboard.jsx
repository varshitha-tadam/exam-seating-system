import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const FacultyDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5001/invigilation', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Filter assignments for the logged in faculty
                const userEmail = JSON.parse(localStorage.getItem('user'))?.email;
                setAssignments(res.data.filter(a => a.email === userEmail));
            } catch (err) {
                console.error("Error fetching assignments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    if (loading) return <div className="loading-spinner">Loading Assignments...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Faculty Portal</h1>
                <p>Manage your assigned exam duties and room seating</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-value">{assignments.length}</div>
                    <div className="stat-label">Assigned Duties</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-value">Active</div>
                    <div className="stat-label">System Status</div>
                </div>
            </div>

            <div className="dashboard-actions">
                <button className="action-btn" onClick={() => navigate('/exams')}>View All Exams</button>
                <button className="action-btn" onClick={() => navigate('/halls')}>View Hall Maps</button>
            </div>

            <div className="dept-stats">
                <h3>My Invigilation Schedule</h3>
                {assignments.length === 0 ? (
                    <p>No duties assigned yet.</p>
                ) : (
                    <div className="seating-list">
                        {assignments.map((task, i) => (
                            <div key={i} className="seat-summary-card">
                                <h3>{task.exam_name}</h3>
                                <p><strong>Hall:</strong> {task.hall_name}</p>
                                <p><strong>Department:</strong> {task.department}</p>
                                <button className="action-btn primary" onClick={() => navigate(`/allocate/${task.exam_id}`)}>
                                    View Seating Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
