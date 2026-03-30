# Exam Seating Allocation API Documentation

## Base URL
`http://localhost:5001`

## Authentication

### POST `/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "token": "...", "user": { ... } }`

### POST `/signup`
- **Body:** `{ "firstName": "...", "lastName": "...", "email": "...", "password": "...", "department": "..." }`
- **Response:** Success message.

## Seating & Allocation

### POST `/allocate`
- **Role:** Admin / Faculty
- **Body:** `{ "examId": 1, "hallId": 1, "exam_name": "...", "exam_date": "..." }`
- **Effect:** Runs Zig-Zag distribution algorithm and stores in DB.

### GET `/allocate/:examId`
- **Response:** List of allocated seats with student details.

### GET `/my-seat`
- **Role:** Student
- **Response:** Seat details for the logged-in student.

## Management

### GET `/stats`
- **Role:** Admin / Faculty
- **Response:** System-wide statistics.

### GET `/exams`
- **Response:** List of scheduled exams.

### GET `/halls`
- **Response:** List of available halls and capacities.

### GET `/students`
- **Response:** List of registered students.

## AI Chatbot

### POST `/chat`
- **Body:** `{ "message": "..." }`
- **Response:** `{ "reply": "..." }` (Powered by Gemini AI)
