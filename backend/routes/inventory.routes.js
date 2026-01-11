const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { isAdmin, hasReadAccess } = require("../middleware/roleMiddleware");
const {
  getInventory,
  addItem,
  updateStock,
  deleteItem,
  exportToCSV,
  exportToPDF
} = require("../controllers/inventory.controller");

router.get("/", hasReadAccess, getInventory);  // Both admin and user can read
router.post("/", isAdmin, addItem);            // Only admin can add
router.post("/update", isAdmin, updateStock);  // Only admin can update
router.delete("/:id", isAdmin, deleteItem);    // Only admin can delete

// Export routes
router.get("/export/csv", isAdmin, exportToCSV);   // Only admin can export to CSV
router.get("/export/pdf", isAdmin, exportToPDF);   // Only admin can export to PDF

module.exports = router;
