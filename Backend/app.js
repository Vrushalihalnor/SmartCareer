const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ✅ Import route files
const registerRoutes = require("./Register");
const loginRoutes = require("./Login");

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Mount routes
app.use("/api", registerRoutes);  // POST /api/register
app.use("/api", loginRoutes);     // POST /api/login

// ✅ Root route for sanity check
app.get("/", (req, res) => {
  res.send("Server is running. Use /api endpoints for operations.");
});

// ✅ Start server on port 3300 (not 3306)
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
