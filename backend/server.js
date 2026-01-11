require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* Middleware */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

/* Database */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    
    // Create default users if they don't exist
    const User = require('./models/User');
    
    // Check if default admin user exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const defaultAdmin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin user created: admin / admin123');
    }
    
    // Check if default user exists
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      const defaultUser = new User({
        username: 'user',
        password: 'user123',
        role: 'user'
      });
      await defaultUser.save();
      console.log('✅ Default user created: user / user123');
    }
  })
  .catch(err => console.error("❌ Mongo error", err));

/* Routes */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));

/* Health Check */
app.get("/health", (req, res) => {
  res.json({ status: "UP", time: new Date() });
});

/* Root */
app.get("/", (req, res) => {
  res.send("Inventory Backend Running");
});

/* Error Handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

/* Graceful Shutdown */
process.on("SIGINT", async () => {
  console.log("🔴 Server shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);