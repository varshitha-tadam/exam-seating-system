import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../api';
import './AIChatbot.css';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'bot', text: "Hello! I'm ExamBot. How can I help you with the seating system today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { role: 'user', text: message };
        setChat(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/chat`, { message }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChat(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <span className="bot-icon">🤖</span>
                    <span className="bot-text">Ask ExamBot</span>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>ExamBot AI</h3>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="chatbot-messages">
                        {chat.map((msg, i) => (
                            <div key={i} className={`message ${msg.role}`}>
                                <div className="message-content">{msg.text}</div>
                            </div>
                        ))}
                        {loading && <div className="message bot loading"><span>.</span><span>.</span><span>.</span></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form className="chatbot-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
