require("dotenv").config({ path: __dirname + '/.env' });
const mongoose = require("mongoose");

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    
    const db = mongoose.connection.db;
    const collection = db.collection('inventories');
    
    // Get all items
    const items = await collection.find({}).toArray();
    console.log(`\n📦 Found ${items.length} items to fix`);
    
    // Update each item to use correct field names
    for (const item of items) {
      const updateFields = {};
      
      // Map old field names to new ones
      if (item.itemName !== undefined) {
        updateFields.name = item.itemName;
      }
      if (item.quantityAvailable !== undefined) {
        updateFields.quantity = item.quantityAvailable;
      }
      if (item.stockStatus !== undefined) {
        // Don't use stockStatus, let the schema calculate status
        // Just remove it by unsetting
      }
      
      // Update the document
      await collection.updateOne(
        { _id: item._id },
        { 
          $set: updateFields,
          $unset: { itemName: "", quantityAvailable: "", stockStatus: "" }
        }
      );
      
      console.log(`✅ Fixed: ${item.itemName || item.name}`);
    }
    
    console.log("\n✅ All items fixed!");
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixDatabase();
