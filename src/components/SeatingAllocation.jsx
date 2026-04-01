import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import './Seating.css';

const SeatingAllocation = () => {
    const [exams, setExams] = useState([]);
    const [halls, setHalls] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedHall, setSelectedHall] = useState('');
    const [seatingData, setSeatingData] = useState([]);
    const [hallDetail, setHallDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useState('sequential');
    const [searchTerm, setSearchTerm] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [showSelector, setShowSelector] = useState(false);
    const [activeSeat, setActiveSeat] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No token found. Please login again.");
                const [exRes, hlRes, stRes] = await Promise.all([
                    axios.get(`${API_URL}/exams`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/halls`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setExams(exRes.data);
                setHalls(hlRes.data);
                setAllStudents(stRes.data);
            } catch (err) {
                console.error("Fetch error:", err);
                alert("Failed to load data. Please logout and login again.");
            }
        };
        fetchData();
    }, []);

    const handleFetchSeating = async (examId, hallId) => {
        const targetExam = examId || selectedExam;
        const targetHall = hallId || selectedHall;
        if (!targetExam || !targetHall) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/allocate/${targetExam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // ONLY show students allocated to THIS specifically selected hall
            const filtered = res.data.filter(s => s.hall_id === parseInt(targetHall));
            setSeatingData(filtered);
            
            const hall = halls.find(h => h.id === parseInt(targetHall));
            setHallDetail(hall);
        } catch (err) {
            console.error("Fetch seating error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExamChange = (e) => {
        const examId = e.target.value;
        setSelectedExam(examId);
        const exam = exams.find(ex => ex.id === parseInt(examId));
        if (exam && exam.hall_id) {
            setSelectedHall(exam.hall_id.toString());
            // Auto-fetch seating for this exam+hall combo
            handleFetchSeating(examId, exam.hall_id.toString());
        }
    };

    const handleAutoAllocate = async () => {
        if (!selectedExam || !selectedHall) return alert("Select Exam and Hall first");
        if (!window.confirm("This will clear existing allocations for this hall. Continue?")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const exam = exams.find(e => e.id === parseInt(selectedExam));
            const hall = halls.find(h => h.id === parseInt(selectedHall));
            await axios.post(`${API_URL}/allocate`, {
                examId: selectedExam,
                hallId: selectedHall,
                exam_name: exam.name,
                exam_date: exam.date,
                hallName: hall.name,
                algorithm: strategy
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            handleFetchSeating();
            alert(`Auto-allocated using ${strategy} strategy.`);
        } catch (err) {
            alert(err.response?.data?.message || "Allocation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (seatNo, student) => {
        if (!isManualMode) return;
        if (student) {
            if (window.confirm(`Unassign ${student.name} from seat ${seatNo}?`)) {
                // To-do: Add unassign endpoint if needed, for now we just skip
                alert("Feature coming soon: Use 'View Plan' to refresh after manual edits.");
            }
        } else {
            setActiveSeat(seatNo);
            setShowSelector(true);
        }
    };

    const handleManualAssign = async (studentEmail) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const exam = exams.find(e => e.id === parseInt(selectedExam));
            const hall = halls.find(h => h.id === parseInt(selectedHall));
            
            await axios.post(`${API_URL}/allocate-manual`, {
                studentEmail,
                examId: selectedExam,
                hallId: selectedHall,
                seatNumber: activeSeat,
                hallName: hall.name,
                examName: exam.name,
                examDate: exam.date
            }, { headers: { Authorization: `Bearer ${token}` } });

            setShowSelector(false);
            handleFetchSeating();
        } catch (err) {
            alert(err.response?.data?.message || "Manual assignment failed");
        } finally {
            setLoading(false);
        }
    };

    const renderGrid = () => {
        if (!hallDetail) return <div className="no-hall">Select Exam & Hall to view grid</div>;
        const { rows, cols } = hallDetail;
        let grid = [];
        for (let r = 1; r <= rows; r++) {
            let rowSeats = [];
            for (let c = 1; c <= cols; c++) {
                const seatNo = `${String.fromCharCode(64 + r)}${c}`;
                const student = seatingData.find(s => s.seat_number === seatNo);
                rowSeats.push(
                    <div 
                        key={seatNo} 
                        className={`seat ${student ? 'occupied' : 'empty'} ${isManualMode ? 'clickable' : ''}`}
                        onClick={() => handleSeatClick(seatNo, student)}
                    >
                        <div className="seat-id">{seatNo}</div>
                        {student && (
                            <div className="seat-pop">
                                <strong>{student.name}</strong><br/>
                                {student.roll_number || student.regNo || student.rollNumber}<br/>
                                <span className="dept-tag">{student.department || student.dept}</span>
                            </div>
                        )}
                    </div>
                );
            }
            grid.push(<div key={r} className="grid-row">{rowSeats}</div>);
        }
        return grid;
    };

    const handleExportPDF = () => {
        window.print(); // Simple way for prototype; in real app use jsPDF
    };

    return (
        <div className="seating-container">
            <header className="seating-header">
                <h2>Seating Allocation & Grid</h2>
                <div className="controls">
                    <select value={selectedExam} onChange={handleExamChange}>
                        <option value="">Select Exam</option>
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                    <select value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)}>
                        <option value="">Select Hall</option>
                        {halls.map(h => <option key={h.id} value={h.id}>{h.name} (Cap: {h.capacity})</option>)}
                    </select>
                    <button className="view-btn" onClick={() => handleFetchSeating()} disabled={loading}>View Plan</button>
                    <select value={strategy} onChange={(e) => setStrategy(e.target.value)} title="Allocation Strategy">
                        <option value="sequential">Sequential (Fill Rows)</option>
                        <option value="roll_number">Roll Number Wise</option>
                        <option value="alphabetical">Alphabetical Name</option>
                        <option value="random">Random/Shuffle</option>
                    </select>
                    <button className="primary" onClick={handleAutoAllocate} disabled={loading}>Auto-Allocate</button>
                    <button className={`mode-toggle ${isManualMode ? 'active' : ''}`} onClick={() => setIsManualMode(!isManualMode)}>
                        {isManualMode ? 'Exit Manual' : 'Manual Allocation'}
                    </button>
                    <button className="export" onClick={handleExportPDF}>Export PDF</button>
                </div>
            </header>

            {showSelector && (
                <div className="allocation-modal">
                    <div className="modal-content glass">
                        <h3>Select Student for Seat {activeSeat}</h3>
                        <input 
                            type="text" 
                            placeholder="Search by name or roll no..." 
                            className="student-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="student-list-picker">
                            {allStudents
                                .filter(s => !seatingData.some(assigned => assigned.student_email === s.email))
                                .filter(s => 
                                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(s => (
                                    <div key={s.id} className="student-option" onClick={() => handleManualAssign(s.email)}>
                                        <div className="s-info">
                                            <strong>{s.name}</strong>
                                            <span>{s.rollNumber} | {s.department}</span>
                                        </div>
                                        <button className="assign-btn">Assign</button>
                                    </div>
                                ))
                            }
                            {allStudents.filter(s => !seatingData.some(assigned => assigned.student_email === s.email)).length === 0 && (
                                <p>No more students available to allocate.</p>
                            )}
                        </div>
                        <button className="close-modal" onClick={() => setShowSelector(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {loading ? <div className="loading">Processing...</div> : (
                <div className="visual-grid">
                    {renderGrid()}
                </div>
            )}

            {seatingData.length > 0 && (
                <div className="seating-table-view">
                    <h3>Allocation List</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Seat</th>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seatingData.map((s, i) => (
                                <tr key={i}>
                                    <td>{s.seat_number}</td>
                                    <td>{s.roll_number || s.regNo}</td>
                                    <td>{s.name}</td>
                                    <td>{s.department || s.dept}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SeatingAllocation;
