# Exam Seating Allocation System

A full-stack, AI-powered system for managing exam seating with advanced distribution algorithms and role-based access.

## Tech Stack
- **Frontend:** React (Vite) + Vanilla CSS
- **Backend:** Node.js + Express
- **Database:** MySQL
- **AI:** Google Gemini API

## Quick Start

### 1. Database Setup
- Create a MySQL database named `examseating`.
- Run the SQL statements in `backend/setup.sql`.
- Configuration is in `backend/.env`.

### 2. Backend Installation
```bash
cd backend
npm install
node server.js
```
The server will run on `http://localhost:5001`.

### 3. Initialize & Seed
Once the backend is running, visit:
- `http://localhost:5001/init-db` - To initialize tables.
- `http://localhost:5001/seed-admin` - To create demo users and sample data.

**Demo Credentials:**
- **Admin:** `admin@examseat.com` / `Admin@2024!`
- **Faculty:** `faculty@examseat.com` / `Faculty@2024!`

### 4. Frontend Installation
```bash
# In the root directory
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## Key Features
- **Zig-Zag Allocation:** Students are seated in a zig-zag pattern across rows.
- **Dept Mixing:** The algorithm ensures students from different departments are seated adjacently whenever possible.
- **Interactive Grid:** Admins can view hall maps and hover over seats to see student details.
- **AI Chatbot:** "ExamBot" is available on all pages to answer system-related queries.
- **PDF Export:** Export seating plans directly from the browser.
