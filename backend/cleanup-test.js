require("dotenv").config({ path: __dirname + '/.env' });
const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    
    // Delete test item
    const result = await Inventory.deleteOne({ name: "Test Item" });
    console.log(`✅ Deleted ${result.deletedCount} test item(s)`);
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanup();
