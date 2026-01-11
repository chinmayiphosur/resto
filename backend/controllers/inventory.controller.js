const Inventory = require("../models/Inventory");
const fs = require('fs');
const PDFDocument = require('pdfkit');

// GET all inventory
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    
    // Check for low stock items
    const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
    
    res.json({
      items,
      lowStockItems,
      lowStockCount: lowStockItems.length
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
};

// ADD item
exports.addItem = async (req, res) => {
  try {
    console.log("Received add item request:", req.body);
    const item = new Inventory(req.body);
    await item.save();
    console.log("Item saved successfully:", item);
    res.json({ message: "Item added successfully", item });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Error adding item", error: error.message });
  }
};

// UPDATE stock
exports.updateStock = async (req, res) => {
  try {
    const { id, quantityUsed, newQuantity, newReorderLevel } = req.body;

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // If newQuantity is provided, update to exact quantity (for admin editing)
    if (newQuantity !== undefined) {
      item.quantity = newQuantity;
      if (item.quantity < 0) item.quantity = 0;
    }
    // If newReorderLevel is provided, update reorder level (for admin editing)
    if (newReorderLevel !== undefined) {
      item.reorderLevel = newReorderLevel;
    }
    // If quantityUsed is provided, decrease quantity (for consumption)
    else if (quantityUsed !== undefined) {
      item.quantity -= quantityUsed;
      if (item.quantity < 0) item.quantity = 0;
    }

    await item.save();

    // Fetch the updated item to get the correct status
    const updatedItem = await Inventory.findById(id);

    res.json({
      message: "Stock updated",
      quantity: updatedItem.quantity,
      status: updatedItem.status
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Error updating stock", error: error.message });
  }
};

// DELETE item
exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};

// Export inventory to CSV
exports.exportToCSV = async (req, res) => {
  try {
    const items = await Inventory.find();
    
    if (items.length === 0) {
      return res.status(404).json({ message: "No inventory items found" });
    }
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    
    // Create CSV content
    const headers = ['name', 'category', 'quantity', 'unit', 'reorderLevel', 'lastRestocked', 'status'];
    const csvContent = [
      headers.join(','), // Header row
      ...items.map(item => [
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.reorderLevel,
        item.lastRestocked.toISOString(),
        item.status
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: "Error exporting to CSV", error: error.message });
  }
};

// Export inventory to PDF
exports.exportToPDF = async (req, res) => {
  try {
    const items = await Inventory.find();
    
    if (items.length === 0) {
      return res.status(404).json({ message: "No inventory items found" });
    }
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.pdf');
    
    const doc = new PDFDocument();
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Inventory Report', 50, 50);
    doc.moveDown();
    
    // Add date
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.y);
    doc.moveDown(2);
    
    // Add table headers
    const startY = doc.y;
    doc.fontSize(12).text('Item Name', 50, doc.y);
    doc.text('Category', 150, doc.y);
    doc.text('Quantity', 250, doc.y);
    doc.text('Unit', 320, doc.y);
    doc.text('Reorder Level', 380, doc.y);
    doc.text('Status', 480, doc.y);
    
    doc.moveTo(50, startY + 20).lineTo(550, startY + 20).stroke();
    
    // Add table rows
    let yPosition = startY + 30;
    items.forEach(item => {
      doc.fontSize(10);
      doc.text(item.name, 50, yPosition);
      doc.text(item.category, 150, yPosition);
      doc.text(item.quantity.toString(), 250, yPosition);
      doc.text(item.unit, 320, yPosition);
      doc.text(item.reorderLevel.toString(), 380, yPosition);
      doc.text(item.status, 480, yPosition);
      
      yPosition += 20;
      
      // Add horizontal line
      doc.moveTo(50, yPosition - 10).lineTo(550, yPosition - 10).stroke();
      
      // Check if we need a new page
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50;
      }
    });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error exporting to PDF", error: error.message });
  }
};