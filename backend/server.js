require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("./db");

const app = express();

// ─────────────────────────────────────────────
// CORS FIX — UPDATED
// ─────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'https://exam-seating-system-one.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5001'
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const SECRET = process.env.JWT_SECRET || "examSeat_super_secret_key_2024";
const PORT = process.env.PORT || 5001;

// ─────────────────────────────────────────────
// MIDDLEWARE: Verify JWT token
// ─────────────────────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// MIDDLEWARE: Only admin or faculty
function requireAdminOrFaculty(req, res, next) {
  const role = req.user.role?.toLowerCase();
  if (role !== "admin" && role !== "faculty") {
    return res.status(403).json({ message: "Access denied. Admin or Faculty only." });
  }
  next();
}

// MIDDLEWARE: Only admin
function requireAdmin(req, res, next) {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
}

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// POST /login — Login with real DB user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
      },
    });
  });
});

// POST /signup — Register new user (role defaults to student)
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, department } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (first_name, last_name, email, password, role, department) VALUES (?, ?, ?, ?, 'student', ?)",
      [firstName, lastName, email, hash, department || ""],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res.status(409).json({ message: "Email already registered" });
          return res.status(500).json({ message: "DB error", error: err });
        }
        res.json({ message: "Signup successful! You can now log in." });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// USER MANAGEMENT (Admin only)
// ─────────────────────────────────────────────

// GET /users — List all users
app.get("/users", verifyToken, requireAdmin, (req, res) => {
  db.query(
    "SELECT id, first_name, last_name, email, role, department, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

// PATCH /users/:id/role — Change user role
app.patch("/users/:id/role", verifyToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  const validRoles = ["admin", "faculty", "student"];
  if (!validRoles.includes(role))
    return res.status(400).json({ message: "Invalid role. Use: admin, faculty, student" });

  db.query(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User not found" });
      res.json({ message: `Role updated to ${role} successfully` });
    }
  );
});

// DELETE /users/:id — Delete a user
app.delete("/users/:id", verifyToken, requireAdmin, (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  });
});

// ─────────────────────────────────────────────
// SEATING ROUTES
// ─────────────────────────────────────────────

// GET /my-seat — Student sees their own seat
app.get("/my-seat", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM seating WHERE student_email = ? ORDER BY allocated_at DESC",
    [req.user.email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

// POST /allocate — Admin/Faculty allocates seat with advanced logic
app.post("/allocate", verifyToken, requireAdminOrFaculty, (req, res) => {
  const { examId, hallId, exam_name, exam_date, algorithm, hallName } = req.body;

  db.query("SELECT * FROM halls WHERE id = ?", [hallId], (err, halls) => {
    if (err || halls.length === 0) return res.status(404).json({ message: "Hall not found" });
    const hall = halls[0];
    const { rows, cols, capacity } = hall;

    db.query(
      "SELECT id, email, department, roll_number, first_name, last_name FROM users WHERE role = 'student' AND email NOT IN (SELECT student_email FROM seating WHERE exam_id = ?)",
      [examId],
      (err, students) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (students.length === 0) return res.status(400).json({ message: "No students left to allocate" });

        console.log(`🚀 ALLOCATING: Algorithm=${algorithm} | Students Count=${students.length}`);

        let processedStudents = [...students];
        if (algorithm === 'roll_number') {
          processedStudents.sort((a, b) => (a.roll_number || "").localeCompare(b.roll_number || "", undefined, { numeric: true }));
        } else if (algorithm === 'alphabetical') {
          processedStudents.sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));
        } else if (algorithm === 'random') {
          processedStudents.sort(() => Math.random() - 0.5);
        } else {
          processedStudents.sort((a, b) => a.id - b.id);
        }

        const allocation = [];
        let r = 1, c = 1;
        let count = 0;

        for (let i = 0; i < Math.min(processedStudents.length, capacity); i++) {
          const student = processedStudents[i];
          const seatNo = `${String.fromCharCode(64 + r)}${c}`;

          allocation.push([
            student.email,
            hall.id,
            hallName || hall.name,
            seatNo,
            examId,
            exam_name,
            exam_date
          ]);

          count++;

          if (c < cols) {
            c++;
          } else {
            c = 1;
            r++;
          }
          if (r > rows) break;
        }

        db.query("DELETE FROM seating WHERE exam_id = ? AND hall_id = ?", [examId, hallId], (delErr) => {
          if (delErr) return res.status(500).json({ message: "DB error", error: delErr });

          db.query(
            "INSERT INTO seating (student_email, hall_id, hall, seat_number, exam_id, exam_name, exam_date) VALUES ?",
            [allocation],
            (err) => {
              if (err) return res.status(500).json({ message: "DB error", error: err });
              res.json({ message: `Successfully allocated ${count} students using '${algorithm || 'standard'}' strategy.`, total: count });
            }
          );
        });
      }
    );
  });
});

// GET /allocate/:examId — Get seating for an exam
app.get("/allocate/:examId", verifyToken, (req, res) => {
  const query = `
    SELECT s.*, u.first_name, u.last_name, u.department, u.roll_number 
    FROM seating s
    JOIN users u ON s.student_email = u.email
    WHERE s.exam_id = ?
  `;
  db.query(query, [req.params.examId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results.map(s => ({
      ...s,
      name: `${s.first_name} ${s.last_name}`,
      regNo: s.roll_number || s.student_email.split('@')[0],
      dept: s.department
    })));
  });
});

// DELETE /allocate/:examId — Clear seating for an exam
app.delete("/allocate/:examId", verifyToken, requireAdminOrFaculty, (req, res) => {
  db.query(
    "DELETE FROM seating WHERE exam_id = ?",
    [req.params.examId],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Seating cleared" });
    }
  );
});

// ─────────────────────────────────────────────
// HALLS MANAGEMENT
// ─────────────────────────────────────────────
app.get("/halls", verifyToken, (req, res) => {
  db.query(
    `SELECT h.*, 
     (SELECT COUNT(*) FROM seating WHERE hall_id = h.id) as occupied 
     FROM halls h 
     ORDER BY h.name ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

app.post("/halls", verifyToken, requireAdminOrFaculty, (req, res) => {
  const { name, capacity, rows, cols } = req.body;
  db.query(
    "INSERT INTO halls (name, capacity, `rows`, `cols`) VALUES (?, ?, ?, ?)",
    [name, capacity, rows, cols],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ id: result.insertId, message: "Hall added successfully" });
    }
  );
});

app.delete("/halls/:id", verifyToken, requireAdminOrFaculty, (req, res) => {
  db.query("DELETE FROM halls WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Hall deleted" });
  });
});

// ─────────────────────────────────────────────
// EXAMS MANAGEMENT
// ─────────────────────────────────────────────
app.get("/exams", verifyToken, (req, res) => {
  const query = `
    SELECT e.*, h.name as hall_name,
    (SELECT COUNT(*) FROM seating WHERE exam_id = e.id) as allocated
    FROM exams e 
    LEFT JOIN halls h ON e.hall_id = h.id 
    ORDER BY e.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
});

app.post("/exams", verifyToken, requireAdminOrFaculty, (req, res) => {
  const { name, subject, date, time, hall_id } = req.body;
  db.query(
    "INSERT INTO exams (name, subject, `date`, `time`, hall_id) VALUES (?, ?, ?, ?, ?)",
    [name, subject, date, time, hall_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ id: result.insertId, message: "Exam scheduled successfully" });
    }
  );
});

app.delete("/exams/:id", verifyToken, requireAdminOrFaculty, (req, res) => {
  db.query("DELETE FROM exams WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Exam deleted" });
  });
});

// ─────────────────────────────────────────────
// ATTENDANCE & INVIGILATION
// ─────────────────────────────────────────────

app.patch("/seating/:id/attendance", verifyToken, requireAdminOrFaculty, (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE seating SET attendance = ? WHERE id = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: `Attendance marked as ${status}` });
    }
  );
});

app.get("/faculty", verifyToken, requireAdminOrFaculty, (req, res) => {
  db.query("SELECT id, first_name, last_name, email, department FROM users WHERE role = 'faculty' ORDER BY first_name ASC", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
});

app.get("/seed-faculty", async (req, res) => {
  try {
    const hash = await bcrypt.hash("Faculty@2024!", 10);
    const faculty = [
      ['Dr. Arjun', 'Sharma', 'faculty@examseat.com', 'Computer Science'],
      ['Prof. Meena', 'Patel', 'meena.patel@examseat.com', 'Information Technology'],
      ['Dr. Ravi', 'Rao', 'ravi.rao@examseat.com', 'Software Engineering'],
      ['Prof. Lakshmi', 'Nair', 'lakshmi.nair@examseat.com', 'AI & Data Science'],
    ];
    const values = faculty.map(f => [f[0], f[1], f[2], hash, 'faculty', f[3]]);
    db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, department) VALUES ?
       ON DUPLICATE KEY UPDATE role='faculty', first_name=VALUES(first_name), last_name=VALUES(last_name)`,
      [values],
      (err) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.json({
          message: "4 default faculty seeded ✅",
          accounts: faculty.map(f => ({ name: `${f[0]} ${f[1]}`, email: f[2], password: 'Faculty@2024!', dept: f[3] }))
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Seed failed" });
  }
});

app.post("/invigilation", verifyToken, requireAdminOrFaculty, (req, res) => {
  const { faculty_id, exam_id, hall_id } = req.body;
  db.query(
    "INSERT INTO invigilators (faculty_id, exam_id, hall_id) VALUES (?, ?, ?)",
    [faculty_id, exam_id, hall_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ id: result.insertId, message: "Invigilator assigned successfully" });
    }
  );
});

app.get("/invigilation", verifyToken, (req, res) => {
  db.query(
    `SELECT i.*, f.first_name, f.last_name, f.email as faculty_email, f.department as faculty_dept,
     e.name as exam_name, e.date as exam_date, e.time as exam_time,
     h.name as hall_name 
     FROM invigilators i
     JOIN users f ON i.faculty_id = f.id
     JOIN exams e ON i.exam_id = e.id
     JOIN halls h ON i.hall_id = h.id
     ORDER BY e.date ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

app.delete("/invigilation/:id", verifyToken, requireAdmin, (req, res) => {
  db.query("DELETE FROM invigilators WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Assignment not found" });
    res.json({ message: "Assignment removed successfully" });
  });
});

app.post("/notifications/send", verifyToken, requireAdmin, (req, res) => {
  const { title, message, targetRole } = req.body;
  console.log(`📢 [NOTIFICATION] To: ${targetRole} | Title: ${title} | Message: ${message}`);
  res.json({ message: "Notifications queued successfully (Mock)" });
});

// ─────────────────────────────────────────────
// MANUAL ALLOCATION
// ─────────────────────────────────────────────
app.post("/allocate-manual", verifyToken, requireAdminOrFaculty, (req, res) => {
  const { studentEmail, examId, hallId, seatNumber, hallName, examName, examDate } = req.body;

  if (!studentEmail || !examId || !hallId || !seatNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.query("SELECT * FROM seating WHERE exam_id = ? AND hall_id = ? AND seat_number = ?", [examId, hallId, seatNumber], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (results.length > 0) return res.status(400).json({ message: "Seat already occupied" });

    db.query("SELECT * FROM seating WHERE student_email = ? AND exam_id = ?", [studentEmail, examId], (err, sResults) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (sResults.length > 0) return res.status(400).json({ message: "Student already has a seat for this exam" });

      const sql = "INSERT INTO seating (student_email, hall_id, hall, seat_number, exam_id, exam_name, exam_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(sql, [studentEmail, hallId, hallName, seatNumber, examId, examName, examDate], (instErr) => {
        if (instErr) return res.status(500).json({ message: "Failed to allocate manually", error: instErr });
        res.json({ message: "Seat allocated successfully ✅" });
      });
    });
  });
});

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
app.get("/stats", verifyToken, requireAdminOrFaculty, (req, res) => {
  const queries = {
    students: "SELECT COUNT(*) as count FROM users WHERE role = 'student'",
    halls: "SELECT COUNT(*) as count FROM halls",
    exams: "SELECT COUNT(*) as count FROM exams",
    allocations: "SELECT COUNT(*) as count FROM seating",
    deptStats: "SELECT department, COUNT(*) as count FROM users WHERE role = 'student' GROUP BY department"
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, rows) => {
      if (err) {
        console.error(`Error in /stats query (${key}):`, err.message);
        results[key] = [{ count: 0 }];
      } else {
        results[key] = rows;
      }
      completed++;
      if (completed === total) {
        res.json({
          students: (results.students[0] || { count: 0 }).count,
          halls: (results.halls[0] || { count: 0 }).count,
          exams: (results.exams[0] || { count: 0 }).count,
          allocations: (results.allocations[0] || { count: 0 }).count,
          deptStats: results.deptStats || []
        });
      }
    });
  });
});

// ─────────────────────────────────────────────
// STUDENT MANAGEMENT
// ─────────────────────────────────────────────
app.get("/students", verifyToken, (req, res) => {
  db.query(
    "SELECT id, first_name, last_name, email, department, roll_number FROM users WHERE role='student'",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results.map(s => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        email: s.email,
        department: s.department,
        rollNumber: s.roll_number || s.id.toString().padStart(6, "0"),
      })));
    }
  );
});

app.post("/students", verifyToken, requireAdminOrFaculty, async (req, res) => {
  const { name, email, rollNumber, department } = req.body;
  const [firstName, ...rest] = (name || "Student").split(" ");
  const lastName = rest.join(" ") || "";
  const tempPass = await bcrypt.hash("student123", 10);

  db.query(
    "INSERT INTO users (first_name, last_name, email, password, role, department, roll_number) VALUES (?, ?, ?, ?, 'student', ?, ?)",
    [firstName, lastName, email, tempPass, department || "", rollNumber || ""],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "Email already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ id: result.insertId, message: "Student added successfully" });
    }
  );
});

app.delete("/students/:id", verifyToken, requireAdminOrFaculty, (req, res) => {
  db.query("DELETE FROM users WHERE id = ? AND role = 'student'", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Student deleted" });
  });
});

// ─────────────────────────────────────────────
// AI CHATBOT
// ─────────────────────────────────────────────
const genAI = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE"
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const SYSTEM_CONTEXT = `You are ExamBot, a helpful assistant for the ExamSeat Exam Hall Seating Allocation System.
This system helps universities manage exam seating. It has 3 roles:
- Admin: Can manage all students, halls, exams, allocate seats, and manage user roles.
- Faculty: Can view and allocate seats, view students and halls.
- Student: Can only view their own allocated seat and download their admit card.

UI Navigation Guide:
- Dashboard: View live stats (Admins/Faculty).
- Students: Register and manage student records.
- Exam Halls: Add and manage physical halls (rows/cols).
- Exams: Schedule exams and link them to halls.
- Seat Allocation: Use 'Auto-Allocate' with algorithms (Sequential, Random, Alphabetical, Roll Number, Alternate Dept Mixing) or manually click seats in the Interactive Grid to assign students.
- Reports: View department-wise analytics.
- My Seat: (For Students) View allocated exam, hall, and seat number. Download Admit Card from here.

Keep responses concise, premium, and helpful. If asked something unrelated to the system, politely redirect.`;

app.post("/chat", verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  if (!genAI) {
    return res.json({ reply: getRuleBasedReply(message, req.user.role) });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const contextWithData = `${SYSTEM_CONTEXT}\n\nCurrent Date: ${new Date().toLocaleDateString()}\nUser Role: ${req.user.role}\nUser Email: ${req.user.email}\nUser Message: ${message}`;

    const result = await model.generateContent(contextWithData);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.json({ reply: getRuleBasedReply(message, req.user.role) });
  }
});

function getRuleBasedReply(message, role) {
  const msg = message.toLowerCase();
  if (msg.includes("seat") || msg.includes("allocat"))
    return role === "student"
      ? "Your allocated seat is shown on the 'My Seat' page. You can also view a visual map of the hall there."
      : "Go to 'Seat Allocation' in the sidebar, pick an exam and hall, then use 'Auto-Allocate' or click individual seats in the interactive grid.";
  if (msg.includes("student"))
    return "Manage students from the 'Students' page. You can add new students or search for existing ones.";
  if (msg.includes("admit") || msg.includes("card") || msg.includes("download"))
    return role === "student"
      ? "You can download your admit card by clicking the 'Admit Card' button on the 'My Seat' page."
      : "Students can download their own admit cards from their 'My Seat' dashboard once you've allocated them.";
  if (msg.includes("hall") || msg.includes("room"))
    return "You can manage exam halls and their seating capacities (rows/cols) from the 'Exam Halls' page.";
  return "I'm ExamBot! I can help you with seating allocations, student records, and exam schedules. Try asking 'How do I allocate seats?'";
}

// ─────────────────────────────────────────────
// INITIALIZE DATABASE
// ─────────────────────────────────────────────
app.get("/init-db", (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const sqlFile = path.join(__dirname, "setup.sql");

  if (!fs.existsSync(sqlFile)) {
    return res.status(404).json({ message: "setup.sql file not found" });
  }

  const sql = fs.readFileSync(sqlFile, "utf8");
  const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);

  let completed = 0;
  let errors = [];

  const runNext = (index) => {
    if (index >= statements.length) {
      if (errors.length > 0) {
        return res.status(500).json({ message: "Database initialization completed with errors", errors });
      }
      return res.json({ message: "Database initialized successfully! ✅" });
    }

    db.query(statements[index], (err) => {
      if (err) {
        console.error("SQL Error in init-db:", err.message);
        errors.push({ statement: statements[index].substring(0, 50) + "...", error: err.message });
      }
      runNext(index + 1);
    });
  };

  runNext(0);
});

// ─────────────────────────────────────────────
// SEED ADMIN
// ─────────────────────────────────────────────
app.get("/seed-admin", async (req, res) => {
  try {
    const adminHash = await bcrypt.hash("Admin@2024!", 10);
    const facultyHash = await bcrypt.hash("Faculty@2024!", 10);
    const f2Hash = await bcrypt.hash("Faculty@2024!", 10);
    const f3Hash = await bcrypt.hash("Faculty@2024!", 10);
    const f4Hash = await bcrypt.hash("Faculty@2024!", 10);

    db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, department) VALUES
       ('Admin', 'User', 'admin@examseat.com', ?, 'admin', 'Administration'),
       ('Dr. Arjun', 'Sharma', 'faculty@examseat.com', ?, 'faculty', 'Computer Science'),
       ('Prof. Meena', 'Patel', 'meena.patel@examseat.com', ?, 'faculty', 'Information Technology'),
       ('Dr. Ravi', 'Rao', 'ravi.rao@examseat.com', ?, 'faculty', 'Software Engineering'),
       ('Prof. Lakshmi', 'Nair', 'lakshmi.nair@examseat.com', ?, 'faculty', 'AI & Data Science')
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
      [adminHash, facultyHash, f2Hash, f3Hash, f4Hash],
      (err) => {
        if (err) return res.status(500).json({ message: "DB error users", error: err });

        const seedHalls = [
          { name: 'Main Hall A', cap: 60, r: 6, c: 10 },
          { name: 'Examination Center - B', cap: 100, r: 10, c: 10 },
          { name: 'Computer Lab 3', cap: 40, r: 4, c: 10 }
        ];

        const hallPromises = seedHalls.map(h => new Promise((resolve) => {
          db.query("INSERT IGNORE INTO halls (name, capacity, `rows`, `cols`) VALUES (?, ?, ?, ?)", [h.name, h.cap, h.r, h.c], resolve);
        }));

        Promise.all(hallPromises).then(() => {
          const examSeeds = [
            ['Semester Final: Computer Networks', 'Computer Science', 'CURDATE()', '10:00 AM', 1],
            ['Mid-Term: Data Structures', 'Computer Science', 'DATE_ADD(CURDATE(), INTERVAL 2 DAY)', '09:00 AM', 1],
            ['Placement Assessment: Phase 1', 'Placement Cell', 'DATE_ADD(CURDATE(), INTERVAL 5 DAY)', '11:00 AM', 2],
            ['Unit Test: Engineering Maths', 'Basic Sciences', 'DATE_ADD(CURDATE(), INTERVAL 7 DAY)', '02:00 PM', 1],
            ['External Viva: Software Projects', 'Software Engineering', 'DATE_ADD(CURDATE(), INTERVAL 14 DAY)', '10:30 AM', 3],
            ['Mid-Term: Operating Systems', 'Computer Science', 'DATE_ADD(CURDATE(), INTERVAL 3 DAY)', '11:00 AM', 1],
            ['Annual Quiz: General Knowledge', 'Arts', 'DATE_ADD(CURDATE(), INTERVAL 10 DAY)', '03:00 PM', 2],
            ['Lab Exam: Database Mgmt', 'Information Technology', 'DATE_ADD(CURDATE(), INTERVAL 6 DAY)', '09:00 AM', 3],
            ['Semester Final: Machine Learning', 'AI & Data Science', 'DATE_ADD(CURDATE(), INTERVAL 12 DAY)', '10:00 AM', 2],
            ['Mid-Term: Discrete Maths', 'Information Technology', 'DATE_ADD(CURDATE(), INTERVAL 1 DAY)', '02:00 PM', 1]
          ];

          const examPromises = examSeeds.map(ex => new Promise((resolve) => {
            db.query(`INSERT IGNORE INTO exams (name, subject, \`date\`, \`time\`, hall_id) VALUES (?, ?, ${ex[2]}, ?, ?)`, [ex[0], ex[1], ex[3], ex[4]], resolve);
          }));

          const studentSeeds = [
            ['Alice', 'Johnson', 'alice@edu.com', 'CS101', 'Computer Science'],
            ['Bob', 'Smith', 'bob@edu.com', 'CS102', 'Computer Science'],
            ['Charlie', 'Brown', 'charlie@edu.com', 'IT101', 'Information Technology'],
            ['Diana', 'Prince', 'diana@edu.com', 'IT102', 'Information Technology'],
            ['Ethan', 'Hunt', 'ethan@edu.com', 'SE101', 'Software Engineering'],
            ['Fiona', 'Gallagher', 'fiona@edu.com', 'SE102', 'Software Engineering'],
            ['George', 'Miller', 'george@edu.com', 'AI101', 'AI & Data Science'],
            ['Hannah', 'Abbott', 'hannah@edu.com', 'AI102', 'AI & Data Science'],
            ['Ian', 'Somerhalder', 'ian@edu.com', 'CS103', 'Computer Science'],
            ['Jack', 'Sparrow', 'jack@edu.com', 'IT103', 'Information Technology'],
            ['Kelly', 'Clarkson', 'kelly@edu.com', 'BS101', 'Basic Sciences'],
            ['Liam', 'Neeson', 'liam@edu.com', 'BS102', 'Basic Sciences'],
            ['Mia', 'Wallace', 'mia@edu.com', 'ART101', 'Arts'],
            ['Noah', 'Centineo', 'noah@edu.com', 'ART102', 'Arts'],
            ['Olivia', 'Rodrigo', 'olivia@edu.com', 'CS104', 'Computer Science'],
            ['Peter', 'Parker', 'peter@edu.com', 'IT104', 'Information Technology'],
            ['Quinn', 'Fabray', 'quinn@edu.com', 'SE103', 'Software Engineering'],
            ['Riley', 'Reid', 'riley@edu.com', 'AI103', 'AI & Data Science'],
            ['Sophia', 'Turner', 'sophia@edu.com', 'BS103', 'Basic Sciences'],
            ['Thomas', 'Shelby', 'thomas@edu.com', 'ART103', 'Arts']
          ];

          const studentPromises = studentSeeds.map(async s => {
            const hash = await bcrypt.hash("student123", 10);
            return new Promise((resolve) => {
              db.query("INSERT IGNORE INTO users (first_name, last_name, email, password, role, roll_number, department) VALUES (?, ?, ?, ?, 'student', ?, ?)",
                [s[0], s[1], s[2], hash, s[3], s[4]], resolve);
            });
          });

          Promise.all([...examPromises, ...studentPromises]).then(() => {
            db.query(`
              INSERT IGNORE INTO invigilators (faculty_id, exam_id, hall_id)
              SELECT f.id, e.id, e.hall_id
              FROM users f
              JOIN exams e ON (
                (f.email = 'faculty@examseat.com' AND e.id IN (SELECT id FROM exams ORDER BY id LIMIT 3)) OR
                (f.email = 'meena.patel@examseat.com' AND e.id IN (SELECT id FROM exams ORDER BY id LIMIT 6 OFFSET 3)) OR
                (f.email = 'ravi.rao@examseat.com' AND e.id IN (SELECT id FROM exams ORDER BY id LIMIT 2 OFFSET 6)) OR
                (f.email = 'lakshmi.nair@examseat.com' AND e.id IN (SELECT id FROM exams ORDER BY id LIMIT 2 OFFSET 8))
              )
              WHERE f.role = 'faculty' AND e.hall_id IS NOT NULL
            `, (seedErr) => {
              if (seedErr) console.error('Invigilation seed error:', seedErr.message);
              res.json({
                message: "System fully enriched with 10 Exams and 20+ Students ✅",
                users: [
                  { email: "admin@examseat.com", password: "Admin@2024!" },
                  { email: "faculty@examseat.com", password: "Faculty@2024!" }
                ],
                info: "Students can login with password: student123"
              });
            });
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error seeding users" });
  }
});

// Health check
app.get("/", (req, res) => res.json({ status: "ExamSeat API running ✅" }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});