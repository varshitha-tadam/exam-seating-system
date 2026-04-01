import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';
import './Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, halls: 0, exams: 0, allocations: 0, deptStats: [] });
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assignForm, setAssignForm] = useState({ exam_id: '', faculty_id: '' });
    const [assigning, setAssigning] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
        try {
            const [statsRes, examsRes, facultyRes, assignRes] = await Promise.all([
                axios.get(`${API_URL}/stats`, { headers }),
                axios.get(`${API_URL}/exams`, { headers }),
                axios.get(`${API_URL}/faculty`, { headers }),
                axios.get(`${API_URL}/invigilation`, { headers }),
            ]);
            setStats(statsRes.data);
            setExams(examsRes.data);
            setFaculty(facultyRes.data);
            setAssignments(assignRes.data);
        } catch (err) {
            console.error("Error fetching admin data:", err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                alert("Session expired. Please log out and log in again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignForm.exam_id || !assignForm.faculty_id) return alert("Please select both exam and faculty.");
        const exam = exams.find(ex => ex.id === parseInt(assignForm.exam_id));
        if (!exam) return alert("Exam not found.");
        setAssigning(true);
        try {
            await axios.post(`${API_URL}/invigilation`, {
                faculty_id: assignForm.faculty_id,
                exam_id: assignForm.exam_id,
                hall_id: exam.hall_id
            }, { headers });
            setAssignForm({ exam_id: '', faculty_id: '' });
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || "Assignment failed");
        } finally {
            setAssigning(false);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm("Remove this faculty assignment?")) return;
        try {
            await axios.delete(`${API_URL}/invigilation/${id}`, { headers });
            fetchAll();
        } catch (err) {
            alert("Failed to remove assignment");
        }
    };

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

            <div className="assign-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3>Manage Faculty</h3>
                    <button
                        className="assign-btn-submit"
                        style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                        onClick={async () => {
                            try {
                                const res = await axios.get(`${API_URL}/seed-faculty`, { headers });
                                alert(res.data.message);
                                fetchAll();
                            } catch { alert('Seed failed'); }
                        }}
                    >
                        + Add Default Faculty
                    </button>
                </div>
                <p className="assign-subtitle">Assign faculty members as invigilators for specific exams</p>

                {/* Assignment Form */}
                <form className="assign-form" onSubmit={handleAssign}>
                    <select
                        value={assignForm.exam_id}
                        onChange={e => setAssignForm({ ...assignForm, exam_id: e.target.value })}
                        required
                    >
                        <option value="">Select Exam</option>
                        {exams.map(ex => (
                            <option key={ex.id} value={ex.id}>
                                {ex.name} ({ex.date ? new Date(ex.date).toLocaleDateString('en-IN') : 'TBD'})
                            </option>
                        ))}
                    </select>
                    <select
                        value={assignForm.faculty_id}
                        onChange={e => setAssignForm({ ...assignForm, faculty_id: e.target.value })}
                        required
                    >
                        <option value="">Select Faculty</option>
                        {faculty.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.first_name} {f.last_name} — {f.department}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="assign-btn-submit" disabled={assigning}>
                        {assigning ? 'Assigning...' : '+ Assign'}
                    </button>
                </form>

                {/* Assignments Table */}
                <div className="assign-table-wrapper">
                    {assignments.length === 0 ? (
                        <p className="no-assign">No assignments yet. Use the form above to assign faculty.</p>
                    ) : (
                        <table className="assign-table">
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Date</th>
                                    <th>Hall</th>
                                    <th>Assigned Faculty</th>
                                    <th>Department</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((a, i) => (
                                    <tr key={a.id || i}>
                                        <td>{a.exam_name}</td>
                                        <td>{a.exam_date ? new Date(a.exam_date).toLocaleDateString('en-IN') : '—'}</td>
                                        <td>{a.hall_name}</td>
                                        <td>
                                            <span className="faculty-badge">
                                                {a.first_name} {a.last_name}
                                            </span>
                                        </td>
                                        <td>{a.faculty_dept}</td>
                                        <td>
                                            <button className="remove-btn" onClick={() => handleRemove(a.id)}>✕ Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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
