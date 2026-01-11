import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import InventoryTable from "../components/InventoryTable";
import LowStockBanner from "../components/LowStockBanner";
import InventoryCharts from "../components/InventoryCharts";

function Dashboard({ role }) {
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    api.get("/inventory").then(res => {
      setItems(res.data.items || res.data);
      setLowStockItems(res.data.lowStockItems || []);
    });
  }, []);

  const lowStock = lowStockItems.length > 0 ? lowStockItems : items.filter(i => i.quantity <= i.reorderLevel);
  const outOfStock = items.filter(i => i.quantity === 0);
  const available = items.filter(i => i.quantity > i.reorderLevel && i.quantity > 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar role={role} />
      <div className="dashboard">
        <LowStockBanner items={lowStock} />
        
        <div className="stats">
          <StatsCard title="Total Items" value={items.length} />
          <StatsCard title="Available" value={available.length} />
          <StatsCard title="Low Stock" value={lowStock.length} />
          <StatsCard title="Out of Stock" value={outOfStock.length} />
          <StatsCard title="Total Quantity" value={totalQuantity} className="total-quantity" />
        </div>

        <InventoryCharts items={items} />

        <InventoryTable items={items} role={role} />
      </div>
    </>
  );
}

export default Dashboard;