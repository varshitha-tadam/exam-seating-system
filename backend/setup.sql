-- Ensure Clean State
DROP TABLE IF EXISTS invigilators;
DROP TABLE IF EXISTS seating;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS halls;
-- Note: We keep 'users' or we might lose the admin account, but let's drop it if we want a full reset.
-- Let's drop it for consistency.
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','faculty','student') DEFAULT 'student',
  department VARCHAR(100),
  roll_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE halls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  `rows` INT NOT NULL,
  `cols` INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(100),
  `date` DATE NOT NULL,
  `time` VARCHAR(50),
  hall_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE SET NULL
);

CREATE TABLE seating (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_email VARCHAR(150) NOT NULL,
  hall_id INT,
  hall VARCHAR(100) NOT NULL,
  seat_number VARCHAR(20) NOT NULL,
  exam_id INT,
  exam_name VARCHAR(200),
  exam_date VARCHAR(50),
  attendance ENUM('present', 'absent', 'pending') DEFAULT 'pending',
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE invigilators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT,
  exam_id INT,
  hall_id INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);
