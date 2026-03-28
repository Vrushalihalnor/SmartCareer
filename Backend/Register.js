const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// ✅ MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "vrushali@15",
  database: "dgsmartapp",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: test pool connection
db.getConnection((err, connection) => {
  if (err) console.error("❌ MySQL Pool Connection Error:", err);
  else {
    console.log("✅ Connected to MySQL Pool");
    connection.release();
  }
});

// POST /api/register
router.post("/register", async (req, res) => {
  const { name, email, std, password, dob, interest1, interest2, interest3, age_group } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, std, password, dob, interest1, interest2, interest3, age_group)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, email, std, hashedPassword, dob, interest1, interest2, interest3, age_group],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User registered successfully!", user_id: result.insertId });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
