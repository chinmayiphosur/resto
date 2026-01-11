import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4'];
const STATUS_COLORS = ['#00C49F', '#FFBB28', '#FF8042']; // Available, Low Stock, Out of Stock

function InventoryCharts({ items }) {
  const [showCharts, setShowCharts] = useState(false);
  
  // Process data for charts using useMemo for performance optimization
  const chartData = useMemo(() => {
    // Only process data if charts are shown
    if (!showCharts || !items || items.length === 0) return { categoryData: [], statusData: [], topItemsByQuantity: [], lowStockItems: [] };
    
    // Category-based aggregation
    const categoryData = items.reduce((acc, item) => {
      const existing = acc.find(cat => cat.name === item.category);
      if (existing) {
        existing.quantity += item.quantity;
        existing.count += 1;
        existing.totalValue = (existing.totalValue || 0) + (item.quantity * 10); // Assuming avg price of 10
      } else {
        acc.push({
          name: item.category,
          quantity: item.quantity,
          count: 1,
          totalValue: item.quantity * 10 // Assuming avg price of 10
        });
      }
      return acc;
    }, []);

    // Status counts
    const statusCounts = {
      Available: items.filter(item => item.status === 'Available').length,
      'Low Stock': items.filter(item => item.status === 'Low Stock').length,
      'Out of Stock': items.filter(item => item.status === 'Out of Stock').length
    };

    const statusData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    // Top items by quantity
    const topItemsByQuantity = [...items]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        status: item.status
      }));

    // Low stock items
    const lowStockItems = items
      .filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock')
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        reorderLevel: item.reorderLevel,
        category: item.category
      }));

    return {
      categoryData,
      statusData,
      topItemsByQuantity,
      lowStockItems
    };
  }, [items, showCharts]);

  return (
    <div className="inventory-charts">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          className="chart-toggle-btn"
          onClick={() => setShowCharts(!showCharts)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {showCharts ? 'Hide Charts' : 'Show Inventory Charts'}
        </button>
      </div>
      
      {showCharts && (
        <div>
          <h2>Inventory Analytics Dashboard</h2>
          
          <div className="chart-grid">
            {/* Category Quantity Distribution */}
            <div className="chart-container">
              <h3>Quantity by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      value.toLocaleString(), 
                      name === 'quantity' ? 'Quantity' : name === 'count' ? 'Item Count' : name
                    ]}
                    labelFormatter={(value) => `Category: ${value}`}
                  />
                  <Legend />
                  <Bar dataKey="quantity" name="Total Quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Item Count */}
            <div className="chart-container">
              <h3>Items Count by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Items']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="chart-container">
              <h3>Inventory Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Items']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Items by Quantity */}
            <div className="chart-container">
              <h3>Top 10 Items by Quantity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.topItemsByQuantity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Quantity']}
                    labelFormatter={(value) => `Item: ${value}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="quantity" 
                    name="Quantity" 
                    fill="#00C49F" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Low Stock Items */}
            <div className="chart-container">
              <h3>Low Stock & Out of Stock Items</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.lowStockItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(value) => `Item: ${value}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="quantity" 
                    name="Current Quantity" 
                    fill="#FF8042" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="reorderLevel" 
                    name="Reorder Level" 
                    fill="#FF0000" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryCharts;