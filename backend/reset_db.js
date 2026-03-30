const mysql = require("mysql2");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "varsha@123456",
  multipleStatements: true,
});

function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, rows) => {
            if (err) {
                console.error(`FAILED SQL: ${sql.substring(0, 100)}...`);
                console.error("Error Detail:", err.message);
                reject(err);
            }
            else resolve(rows);
        });
    });
}

async function reset() {
    try {
        console.log("Hard Resetting Database...");
        await runSQL("DROP DATABASE IF EXISTS examseating");
        await runSQL("CREATE DATABASE examseating");
        await runSQL("USE examseating");

        console.log("Creating tables...");
        await runSQL(`CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin','faculty','student') DEFAULT 'student',
            department VARCHAR(100),
            roll_number VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await runSQL(`CREATE TABLE halls (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            capacity INT NOT NULL,
            \`rows\` INT NOT NULL,
            \`cols\` INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await runSQL(`CREATE TABLE exams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            subject VARCHAR(100),
            \`date\` DATE NOT NULL,
            \`time\` VARCHAR(50),
            hall_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await runSQL(`CREATE TABLE seating (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_email VARCHAR(150) NOT NULL,
            hall_id INT,
            hall VARCHAR(100) NOT NULL,
            seat_number VARCHAR(20) NOT NULL,
            exam_id INT,
            exam_name VARCHAR(200),
            exam_date VARCHAR(50),
            attendance ENUM('present', 'absent', 'pending') DEFAULT 'pending',
            allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await runSQL(`CREATE TABLE invigilators (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_id INT,
            exam_id INT,
            hall_id INT,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log("Seeding real data...");
        const adminPass = await bcrypt.hash("Admin@2024!", 10);
        const facultyPass = await bcrypt.hash("Faculty@2024!", 10);
        const studentPass = await bcrypt.hash("student123", 10);

        await runSQL("INSERT INTO users (first_name, last_name, email, password, role) VALUES ('Varshitha', 'Admin', 'admin@examseat.com', ?, 'admin')", [adminPass]);
        await runSQL("INSERT INTO users (first_name, last_name, email, password, role) VALUES ('Professor', 'Smith', 'faculty@examseat.com', ?, 'faculty')", [facultyPass]);

        const students = [
            ['Alice', 'Johnson'], ['Bob', 'Anderson'], ['Charlie', 'Davis'], ['Diana', 'Evans'], ['Ethan', 'Foster'],
            ['Fiona', 'Garcia'], ['George', 'Harris'], ['Hannah', 'Irvine'], ['Ian', 'Jackson'], ['Jack', 'Kelly'],
            ['Katelyn', 'Lewis'], ['Liam', 'Miller'], ['Mia', 'Nelson'], ['Noah', 'Owen'], ['Olivia', 'Perez'],
            ['Peter', 'Quinn'], ['Quinn', 'Ross'], ['Riley', 'Sanders'], ['Sophia', 'Taylor'], ['Thomas', 'Upton'],
            ['Uma', 'Vance'], ['Victor', 'Walker'], ['Wendy', 'Xavier'], ['Xander', 'Young'], ['Yara', 'Zimmerman'],
            ['Zoe', 'Abbott'], ['Arthur', 'Baker'], ['Bella', 'Clark'], ['Caleb', 'Douglas'], ['Daisy', 'Ellis'],
            ['Evan', 'Fisher'], ['Faith', 'Grant'], ['Gavin', 'Harper'], ['Heidi', 'Ingram'], ['Isaac', 'Jones']
        ];

        const depts = ['CSE', 'IT', 'ECE', 'MECH', 'AI', 'BS', 'Arts'];
        for (let i = 0; i < students.length; i++) {
            await runSQL("INSERT INTO users (first_name, last_name, email, password, role, roll_number, department) VALUES (?, ?, ?, ?, 'student', ?, ?)",
                [students[i][0], students[i][1], `s${i+1}@edu.com`, studentPass, `REG-${5000 + i}`, depts[i % depts.length]]);
        }

        await runSQL("INSERT INTO halls (name, capacity, \`rows\`, \`cols\`) VALUES ('Main Hall A', 60, 6, 10)");
        await runSQL("INSERT INTO halls (name, capacity, \`rows\`, \`cols\`) VALUES ('Grand Auditorium B', 100, 10, 10)");
        await runSQL("INSERT INTO halls (name, capacity, \`rows\`, \`cols\`) VALUES ('Smart Lab 101', 40, 4, 10)");

        await runSQL("INSERT INTO exams (name, subject, \`date\`, \`time\`, hall_id) VALUES ('Final Exam: Java Programming', 'CSE', CURDATE(), '10:00 AM', 1)");
        await runSQL("INSERT INTO exams (name, subject, \`date\`, \`time\`, hall_id) VALUES ('Mid-Term: Data Science', 'AI', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '02:00 PM', 1)");
        await runSQL("INSERT INTO exams (name, subject, \`date\`, \`time\`, hall_id) VALUES ('Monthly Test: Circuit Analysis', 'ECE', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '09:00 AM', 2)");
        await runSQL("INSERT INTO exams (name, subject, \`date\`, \`time\`, hall_id) VALUES ('Semester Exam: Thermodynamics', 'MECH', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '11:00 AM', 2)");
        await runSQL("INSERT INTO exams (name, subject, \`date\`, \`time\`, hall_id) VALUES ('Placement: Logical Reasoning', 'BS', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '03:00 PM', 3)");

        console.log("Database reset and seeded with real names! 🚀");
        process.exit(0);
    } catch (err) {
        console.error("Critical Failure:", err.message);
        process.exit(1);
    }
}

reset();
