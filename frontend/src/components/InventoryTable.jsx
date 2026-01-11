import { useState } from "react";
import api from "../services/api";

function InventoryTable({ items, role }) {
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [updateStockItem, setUpdateStockItem] = useState(null);
  const [updateStockData, setUpdateStockData] = useState({ quantityChange: 0, action: 'add' }); // 'add' for restock, 'subtract' for destock
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    reorderLevel: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showOthersInput, setShowOthersInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    const matchesStatus = filterStatus ? item.status === filterStatus : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (item) => {
    if (role !== 'admin') return; // Only admins can edit
    setEditItem(item._id);
    setEditData({
      quantity: item.quantity,
      reorderLevel: item.reorderLevel
    });
  };

  const handleSave = async (id) => {
    try {
      await api.post("/inventory/update", {
        id,
        newQuantity: editData.quantity,
        newReorderLevel: editData.reorderLevel
      });
      setEditItem(null);
      window.location.reload(); // Refresh data
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleCancel = () => {
    setEditItem(null);
    setUpdateStockItem(null);
  };

  const handleUpdateStock = (item) => {
    if (role !== 'admin') return; // Only admins can update stock
    setUpdateStockItem(item._id);
    setUpdateStockData({ quantityChange: 0, action: 'add' }); // Default to add/restock
  };

  const handleUpdateStockSave = async (id) => {
    try {
      const item = items.find(i => i._id === id);
      let newQuantity;
      
      if (updateStockData.action === 'add') {
        // Add to stock (restock)
        newQuantity = item.quantity + updateStockData.quantityChange;
      } else {
        // Subtract from stock (destock)
        newQuantity = item.quantity - updateStockData.quantityChange;
        if (newQuantity < 0) newQuantity = 0; // Prevent negative quantities
      }
      
      await api.post("/inventory/update", {
        id,
        newQuantity: newQuantity
      });
      setUpdateStockItem(null);
      window.location.reload(); // Refresh data
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const handleDelete = async (id) => {
    if (role !== 'admin') return; // Only admins can delete
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/inventory/${id}`);
        window.location.reload(); // Refresh data
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const handleAddItem = async () => {
    if (role !== 'admin') return; // Only admins can add items
    
    // Validate required fields
    if (!newItem.name || !newItem.category || newItem.quantity === undefined || !newItem.unit || !newItem.reorderLevel) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Validate that category and unit are properly selected
    if (newItem.category === '') {
      alert("Please select a category");
      return;
    }
    
    if (newItem.unit === '') {
      alert("Please select a unit");
      return;
    }
    
    // If 'Others' is selected for category, custom category must be provided
    if (newItem.category === 'Others' && (!customCategory || !customCategory.trim())) {
      alert("Please enter a custom category when 'Others' is selected");
      return;
    }
    
    // If 'Others' is selected for unit, custom unit must be provided
    if (newItem.unit === 'Others' && (!customUnit || !customUnit.trim())) {
      alert("Please enter a custom unit when 'Others' is selected");
      return;
    }
    
    try {
      // Prepare item to add
      const itemToAdd = { 
        ...newItem,
        quantity: Number(newItem.quantity), // Ensure quantity is a number
        reorderLevel: Number(newItem.reorderLevel) // Ensure reorderLevel is a number
      };
      
      // If custom category is selected, use the custom value
      if (newItem.category === 'Others' && customCategory.trim()) {
        itemToAdd.category = customCategory.trim();
      }
      
      // If custom unit is selected, use the custom value
      if (newItem.unit === 'Others' && customUnit.trim()) {
        itemToAdd.unit = customUnit.trim();
      }
      
      await api.post('/inventory', itemToAdd);
      setShowAddForm(false);
      setNewItem({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        reorderLevel: 0
      });
      setCustomCategory('');
      setCustomUnit('');
      setShowOthersInput(false);
      setShowCustomUnit(false);
      window.location.reload(); // Refresh data
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item: " + (error.response?.data?.message || error.message));
    }
  };

  const handleExportCSV = async () => {
    try {
      // Get the authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      // Create a temporary link to trigger download with proper headers
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/inventory/export/csv`;
      link.setAttribute('download', 'inventory.csv');
      
      // Create a new request with the authorization header
      fetch(link.href, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create a download link for the blob
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.setAttribute('download', 'inventory.csv');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error exporting CSV:", error);
        alert("Error exporting CSV: " + error.message);
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting CSV: " + (error.message || error));
    }
  };

  const handleExportPDF = async () => {
    try {
      // Get the authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }

      // Create a temporary link to trigger download with proper headers
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/inventory/export/pdf`;
      link.setAttribute('download', 'inventory.pdf');
      
      // Create a new request with the authorization header
      fetch(link.href, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create a download link for the blob
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.setAttribute('download', 'inventory.pdf');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error exporting PDF:", error);
        alert("Error exporting PDF: " + error.message);
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF: " + (error.message || error));
    }
  };

  return (
    <div>
      {/* Export buttons at the top */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleExportCSV}
              className="add-btn"
              style={{ background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' }}
            >
              Export CSV
            </button>
            <button 
              onClick={handleExportPDF}
              className="add-btn"
              style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}
            >
              Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Search and filter controls above the table */}
      <div style={{ 
        padding: '15px', 
        background: 'white', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '10px 12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '6px', 
                width: '100%',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ 
                padding: '10px 12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Categories</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Dairy">Dairy</option>
              <option value="Beverages">Beverages</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ 
                padding: '10px 12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Item button */}
      {role === 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="add-btn"
          >
            + Add New Item
          </button>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Last Restocked</th>
              {role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {showAddForm && role === 'admin' && (
              <tr>
                <td colSpan={role === 'admin' ? 8 : 7}>
                  <div className="add-form-container">
                    <h3>Add New Inventory Item</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Item Name</label>
                        <input
                          className="add-item-form"
                          placeholder="Item Name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Category</label>
                        <select
                          className="add-item-form"
                          value={newItem.category}
                          onChange={(e) => {
                            setNewItem({...newItem, category: e.target.value});
                            setShowOthersInput(e.target.value === 'Others');
                          }}
                        >
                          <option value="">Select Category</option>
                          <option value="Grains">Grains</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Others">Others</option>
                        </select>
                        {showOthersInput && (
                          <input
                            className="add-item-form"
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            style={{ marginTop: '8px' }}
                          />
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Quantity</label>
                        <input
                          className="add-item-form"
                          type="number"
                          placeholder="Quantity"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Unit</label>
                        <select
                          className="add-item-form"
                          value={newItem.unit}
                          onChange={(e) => {
                            setNewItem({...newItem, unit: e.target.value});
                            setShowCustomUnit(e.target.value === 'Others');
                          }}
                        >
                          <option value="">Select Unit</option>
                          <option value="kg">kg</option>
                          <option value="liters">liters</option>
                          <option value="packets">packets</option>
                          <option value="pieces">pieces</option>
                          <option value="bottles">bottles</option>
                          <option value="cans">cans</option>
                          <option value="boxes">boxes</option>
                          <option value="Others">Others</option>
                        </select>
                        {showCustomUnit && (
                          <input
                            className="add-item-form"
                            placeholder="Enter custom unit"
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                            style={{ marginTop: '8px' }}
                          />
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Reorder Level</label>
                        <input
                          className="add-item-form"
                          type="number"
                          placeholder="Reorder Level"
                          value={newItem.reorderLevel}
                          onChange={(e) => setNewItem({...newItem, reorderLevel: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div>
                      <button onClick={handleAddItem} className="save-btn" style={{ marginRight: '10px' }}>Add Item</button>
                      <button onClick={() => {
                        setShowAddForm(false);
                        setShowOthersInput(false);
                        setShowCustomUnit(false);
                        setCustomCategory('');
                        setCustomUnit('');
                      }} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {filteredItems.map(i => (
              <tr key={i._id}>
                <td>{i.name}</td>
                <td>{i.category}</td>
                <td>
                  {editItem === i._id ? (
                    <input
                      className="add-item-form"
                      type="number"
                      value={editData.quantity}
                      onChange={(e) => setEditData({...editData, quantity: Number(e.target.value)})}
                      min="0"
                    />
                  ) : (
                    i.quantity
                  )}
                </td>
                <td>{i.unit}</td>
                <td>
                  {editItem === i._id ? (
                    <input
                      className="add-item-form"
                      type="number"
                      value={editData.reorderLevel}
                      onChange={(e) => setEditData({...editData, reorderLevel: Number(e.target.value)})}
                      min="0"
                    />
                  ) : (
                    i.reorderLevel
                  )}
                </td>
                <td className={
                  i.status === 'Out of Stock' ? "out" :
                  i.status === 'Low Stock' ? "low" : "ok"
                }>
                  {i.status}
                </td>
                <td>{new Date(i.lastRestocked).toLocaleDateString()}</td>
                {role === 'admin' && (
                  <td>
                    {editItem === i._id || updateStockItem === i._id ? (
                      <>
                        {editItem === i._id && (
                          <>
                            <button onClick={() => handleSave(i._id)} className="save-btn">Save</button>
                            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                          </>
                        )}
                        {updateStockItem === i._id && (
                          <>
                            <select
                              value={updateStockData.action}
                              onChange={(e) => setUpdateStockData({...updateStockData, action: e.target.value})}
                              style={{ marginRight: '5px', padding: '5px', borderRadius: '3px' }}
                            >
                              <option value="add">Add to Stock</option>
                              <option value="subtract">Subtract from Stock</option>
                            </select>
                            <input
                              className="add-item-form"
                              type="number"
                              value={updateStockData.quantityChange}
                              onChange={(e) => setUpdateStockData({...updateStockData, quantityChange: Number(e.target.value)})}
                              min="0"
                              placeholder="Qty"
                              style={{ width: '60px', marginRight: '5px' }}
                            />
                            <button onClick={() => handleUpdateStockSave(i._id)} className="save-btn">Update</button>
                            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(i)} className="edit-btn">Edit</button>
                        <button onClick={() => handleUpdateStock(i)} className="update-btn">Update Stock</button>
                        <button onClick={() => handleDelete(i._id)} className="delete-btn">Delete</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;