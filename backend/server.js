require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   CORS CONFIG (IMPORTANT)
   ========================= */
const allowedOrigins = [
  "http://localhost:5173",                  // local frontend
  "https://resto-frontend-cbmb.onrender.com" // Render frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   DATABASE CONNECTION
   ========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    const User = require("./models/User");

    // Default admin
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      await User.create({
        username: "admin",
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Default admin created (admin / admin123)");
    }

    // Default user
    const userExists = await User.findOne({ username: "user" });
    if (!userExists) {
      await User.create({
        username: "user",
        password: "user123",
        role: "user",
      });
      console.log("✅ Default user created (user / user123)");
    }
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

/* =========================
   ROUTES
   ========================= */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/health", (req, res) => {
  res.json({ status: "UP", time: new Date() });
});

/* =========================
   ROOT
   ========================= */
app.get("/", (req, res) => {
  res.send("Inventory Backend Running");
});

/* =========================
   ERROR HANDLER
   ========================= */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

/* =========================
   GRACEFUL SHUTDOWN
   ========================= */
process.on("SIGINT", async () => {
  console.log("🔴 Server shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

/* =========================
   START SERVER (RENDER SAFE)
   ========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
