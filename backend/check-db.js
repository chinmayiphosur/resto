require("dotenv").config({ path: __dirname + '/.env' });
const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    
    const items = await Inventory.find();
    console.log(`\n📦 Total items in inventory: ${items.length}`);
    
    if (items.length > 0) {
      console.log("\nInventory items:");
      items.forEach(item => {
        console.log(JSON.stringify(item, null, 2));
      });
    } else {
      console.log("\n⚠️  No items found in the database");
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkDatabase();
