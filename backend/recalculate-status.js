require("dotenv").config({ path: __dirname + '/.env' });
const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

async function recalculateStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    
    const items = await Inventory.find();
    console.log(`\n📦 Found ${items.length} items to update`);
    
    for (const item of items) {
      // Force recalculation by marking quantity as modified
      item.markModified('quantity');
      await item.save();
      console.log(`✅ ${item.name}: ${item.quantity} ${item.unit} (reorder: ${item.reorderLevel}) - ${item.status}`);
    }
    
    console.log("\n✅ All statuses recalculated!");
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

recalculateStatus();
