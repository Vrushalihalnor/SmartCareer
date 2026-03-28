const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// MySQL connection
const db = mysql.createConnection({
  host: "195.35.45.44",
  user: "root",
  password: "vikram123",
  database: "DGExpo"
});

db.connect((err) => {
  if (err) console.error("❌ MySQL Connection Error:", err);
  else console.log("✅ Connected to MySQL");
});

// GET /api/student-interests?email=...&password=...
router.get("/student-interests", async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
    // Find the user by email
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      if (results.length === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const user = results[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: "Invalid password" });
      }

      // Return the three interests
      const interests = [user.interest1, user.interest2, user.interest3];
      res.json({ success: true, interests });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
