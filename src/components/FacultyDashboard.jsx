import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';
import './Dashboard.css';

const FacultyDashboard = () => {
    const [allAssignments, setAllAssignments] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Attendance sheet state
    const [selectedExamId, setSelectedExamId] = useState('');
    const [attendanceStudents, setAttendanceStudents] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [savingIds, setSavingIds] = useState(new Set());

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/invigilation`, { headers });
                setAllAssignments(res.data);
                setMyAssignments(res.data.filter(a => a.faculty_email === user.email));
            } catch (err) {
                console.error("Error fetching assignments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const loadAttendance = async (examId) => {
        if (!examId) { setAttendanceStudents([]); return; }
        setAttendanceLoading(true);
        try {
            const res = await axios.get(`${API_URL}/allocate/${examId}`, { headers });
            setAttendanceStudents(res.data.map(s => ({ ...s, localStatus: s.attendance || 'pending' })));
        } catch (err) {
            console.error("Error loading seating:", err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleExamSelect = (examId) => {
        setSelectedExamId(examId);
        loadAttendance(examId);
    };

    const markAttendance = async (seatId, status) => {
        // Optimistically update local state
        setAttendanceStudents(prev => prev.map(s => s.id === seatId ? { ...s, localStatus: status } : s));
        setSavingIds(prev => new Set([...prev, seatId]));
        try {
            await axios.patch(`${API_URL}/seating/${seatId}/attendance`, { status }, { headers });
        } catch (err) {
            alert("Failed to save attendance");
            // Revert on error
            setAttendanceStudents(prev => prev.map(s => s.id === seatId ? { ...s, localStatus: s.attendance || 'pending' } : s));
        } finally {
            setSavingIds(prev => { const n = new Set(prev); n.delete(seatId); return n; });
        }
    };

    const presentCount = attendanceStudents.filter(s => s.localStatus === 'present').length;
    const absentCount = attendanceStudents.filter(s => s.localStatus === 'absent').length;
    const pendingCount = attendanceStudents.filter(s => s.localStatus === 'pending').length;

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Faculty Portal</h1>
                <p>Welcome, {user.firstName}! Manage your invigilation duties and student attendance.</p>
            </header>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-value">{myAssignments.length}</div>
                    <div className="stat-label">My Duties</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-value">{allAssignments.length}</div>
                    <div className="stat-label">Total Assignments</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-value">Active</div>
                    <div className="stat-label">System Status</div>
                </div>
            </div>

            <div className="dashboard-actions">
                <button className="action-btn" onClick={() => navigate('/exams')}>View All Exams</button>
                <button className="action-btn" onClick={() => navigate('/halls')}>View Hall Maps</button>
                <button className="action-btn primary" onClick={() => navigate('/allocate')}>Seating Allocation</button>
            </div>

            {/* ── ATTENDANCE SHEET ── */}
            <div className="assign-section">
                <h3>📋 Attendance Sheet</h3>
                <p className="assign-subtitle">Select an exam to mark student attendance for your assigned hall</p>

                {/* Exam Selector */}
                <div className="assign-form" style={{ marginBottom: attendanceStudents.length > 0 ? '20px' : '0' }}>
                    <select
                        value={selectedExamId}
                        onChange={e => handleExamSelect(e.target.value)}
                        style={{ flex: 1, minWidth: '250px', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.95rem' }}
                    >
                        <option value="">— Select Exam to View Attendance —</option>
                        {myAssignments.map((a, i) => (
                            <option key={i} value={a.exam_id}>
                                {a.exam_name} — {a.hall_name} ({a.exam_date ? new Date(a.exam_date).toLocaleDateString('en-IN') : 'TBD'})
                            </option>
                        ))}
                        {myAssignments.length === 0 && allAssignments.map((a, i) => (
                            <option key={i} value={a.exam_id}>
                                {a.exam_name} — {a.hall_name}
                            </option>
                        ))}
                    </select>
                    {selectedExamId && (
                        <button
                            className="assign-btn-submit"
                            onClick={() => loadAttendance(selectedExamId)}
                            disabled={attendanceLoading}
                        >
                            🔄 Refresh
                        </button>
                    )}
                </div>

                {/* Attendance Stats */}
                {attendanceStudents.length > 0 && (
                    <>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                ✓ Present: {presentCount}
                            </span>
                            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                ✗ Absent: {absentCount}
                            </span>
                            <span style={{ background: 'rgba(148,163,184,0.15)', color: '#94a3b8', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                ⏳ Pending: {pendingCount}
                            </span>
                            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                Total: {attendanceStudents.length}
                            </span>
                        </div>

                        {/* Attendance Table */}
                        <div className="assign-table-wrapper">
                            <table className="assign-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>#</th>
                                        <th>Seat</th>
                                        <th>Student Name</th>
                                        <th>Roll No.</th>
                                        <th>Department</th>
                                        <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceStudents.map((s, i) => (
                                        <tr key={s.id || i} className={s.localStatus === 'present' ? '' : s.localStatus === 'absent' ? 'absent-row' : ''}>
                                            <td style={{ color: '#64748b' }}>{i + 1}</td>
                                            <td>
                                                <span className="faculty-badge" style={{ fontFamily: 'monospace' }}>{s.seat_number}</span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</td>
                                            <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                {s.roll_number || s.rollNumber || s.regNo || '—'}
                                            </td>
                                            <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.department || s.dept || '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => markAttendance(s.id, 'present')}
                                                        disabled={savingIds.has(s.id)}
                                                        style={{
                                                            background: s.localStatus === 'present' ? '#10b981' : 'rgba(16,185,129,0.12)',
                                                            color: s.localStatus === 'present' ? 'white' : '#34d399',
                                                            border: '1px solid rgba(16,185,129,0.3)',
                                                            padding: '5px 14px',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            fontSize: '0.82rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        ✓ Present
                                                    </button>
                                                    <button
                                                        onClick={() => markAttendance(s.id, 'absent')}
                                                        disabled={savingIds.has(s.id)}
                                                        style={{
                                                            background: s.localStatus === 'absent' ? '#ef4444' : 'rgba(239,68,68,0.12)',
                                                            color: s.localStatus === 'absent' ? 'white' : '#f87171',
                                                            border: '1px solid rgba(239,68,68,0.3)',
                                                            padding: '5px 14px',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            fontSize: '0.82rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        ✗ Absent
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {s.localStatus === 'present' && <span style={{ color: '#34d399', fontWeight: 700 }}>Present</span>}
                                                {s.localStatus === 'absent' && <span style={{ color: '#f87171', fontWeight: 700 }}>Absent</span>}
                                                {s.localStatus === 'pending' && <span style={{ color: '#64748b' }}>—</span>}
                                                {savingIds.has(s.id) && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}> saving…</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {selectedExamId && attendanceLoading && (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading students...</p>
                )}
                {selectedExamId && !attendanceLoading && attendanceStudents.length === 0 && (
                    <p className="no-assign">No students allocated for this exam yet. Go to Seating Allocation first.</p>
                )}
            </div>

            {/* All Assignments Table */}
            <div className="assign-section">
                <h3>🎓 All Faculty-Exam Assignments</h3>
                <p className="assign-subtitle">Complete overview — your assigned exams are highlighted</p>
                <div className="assign-table-wrapper">
                    {allAssignments.length === 0 ? (
                        <p className="no-assign">No assignments yet. Ask the Admin to assign faculty to exams.</p>
                    ) : (
                        <table className="assign-table">
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Hall</th>
                                    <th>Assigned Faculty</th>
                                    <th>Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAssignments.map((a, i) => (
                                    <tr key={i} className={a.faculty_email === user.email ? 'my-row' : ''}>
                                        <td>{a.exam_name}</td>
                                        <td>{a.exam_date ? new Date(a.exam_date).toLocaleDateString('en-IN') : '—'}</td>
                                        <td>{a.exam_time || '—'}</td>
                                        <td>{a.hall_name}</td>
                                        <td>
                                            <span className={`faculty-badge ${a.faculty_email === user.email ? 'my-badge' : ''}`}>
                                                {a.first_name} {a.last_name}
                                                {a.faculty_email === user.email && ' (You)'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{a.faculty_dept}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
