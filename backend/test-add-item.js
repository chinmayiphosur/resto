require("dotenv").config({ path: __dirname + '/.env' });
const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

async function testAddItem() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    
    // Test adding an item with custom category
    const testItem = new Inventory({
      name: "Test Item",
      category: "Custom Category",
      quantity: 100,
      unit: "custom unit",
      reorderLevel: 10
    });
    
    await testItem.save();
    console.log("✅ Item saved successfully:", testItem);
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

testAddItem();
