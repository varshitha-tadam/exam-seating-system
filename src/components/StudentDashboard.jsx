import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const StudentDashboard = () => {
    const [mySeat, setMySeat] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMySeat = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5001/my-seat', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMySeat(res.data);
            } catch (err) {
                console.error("Error fetching seat:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMySeat();
    }, []);

    const handleDownloadAdmitCard = (seat) => {
        alert(`Downloading Admit Card for ${seat.exam_name}...\nSeat: ${seat.seat_number}\nHall: ${seat.hall}`);
        // In a real app, this would trigger a PDF generation or download
    };

    if (loading) return <div className="loading-spinner">Fetching Seating Info...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>My Exam Portal</h1>
                <p>View your scheduled exams and seating details</p>
            </header>

            {mySeat.length === 0 ? (
                <div className="no-data-card">
                    <p>No exams assigned to you yet. Please check back later.</p>
                </div>
            ) : (
                <div className="seating-list">
                    {mySeat.map((seat, i) => (
                        <div key={i} className="seat-summary-card">
                            <div className="seat-details">
                                <h3>{seat.exam_name}</h3>
                                <p><strong>Subject:</strong> {seat.subject || "Major Exam"}</p>
                                <p><strong>Date:</strong> {seat.exam_date}</p>
                                <p><strong>Hall:</strong> {seat.hall}</p>
                                <div className="seat-number-badge">
                                    <span className="label">Seat Number</span>
                                    <span className="value">{seat.seat_number}</span>
                                </div>
                            </div>
                            <button className="download-btn" onClick={() => handleDownloadAdmitCard(seat)}>
                                📄 Download Admit Card
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
