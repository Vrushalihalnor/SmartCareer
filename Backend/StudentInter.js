const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vrushali@15",
  database: "dgsmart",
});

db.connect((err) => {
  if (err) console.error("MySQL Connection Error:", err);
  else console.log("✅ Connected to MySQL");
});

// POST /api/studentInter
router.post("/studentInter", (req, res) => {
  console.log("Request body:", req.body); // debug

  const { studentName, dob, ageGroup, interestedSubjects } = req.body;

  if (!studentName || !dob || !ageGroup) {
    return res.status(400).json({ error: "Please provide all required fields" });
  }

  // Split the subjects into three separate columns
  const [subject1, subject2, subject3] = [
    interestedSubjects[0] || null,
    interestedSubjects[1] || null,
    interestedSubjects[2] || null,
  ];

  const query = `
    INSERT INTO students_info
      (studentName, dob, ageGroup, interestedSubject1, interestedSubject2, interestedSubject3)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [studentName, dob, ageGroup, subject1, subject2, subject3],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        message: "Student info submitted successfully",
        studentId: result.insertId,
      });
    }
  );
});

module.exports = router;
    