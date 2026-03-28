const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "vrushali@15",
  database: "dgsmartapp",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", email, password); // debug

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    // ✅ Send full user info including user ID
    res.json({
      message: "Login successful!",
      user: {
        id: user.user_id,               // <- user ID
        name: user.name,
        email: user.email,
        std: user.std,
        password: user.password,    // ⚠️ hashed password
        dob: user.dob,
        interest1: user.interest1,
        interest2: user.interest2,
        interest3: user.interest3,
        age_group: user.age_group,
      },
    });
  });
});

module.exports = router;
