const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  reorderLevel: {
    type: Number,
    required: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Available', 'Low Stock', 'Out of Stock'],
    default: 'Available'
  }
});

// Update status based on quantity and reorder level
inventorySchema.pre('save', function() {
  if (this.isNew || this.isModified('quantity') || this.isModified('reorderLevel')) {
    if (this.quantity === 0) {
      this.status = 'Out of Stock';
    } else if (this.quantity <= this.reorderLevel) {
      this.status = 'Low Stock';
    } else {
      this.status = 'Available';
    }
  }
});

module.exports = mongoose.model("Inventory", inventorySchema);
