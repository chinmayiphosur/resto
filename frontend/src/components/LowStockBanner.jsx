function LowStockBanner({ items }) {
  if (items.length === 0) return null;

  return (
    <div className="warning-banner">
      ⚠ Low Stock Alert: {items.length} item{items.length > 1 ? 's' : ''} below reorder level - {items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}
    </div>
  );
}

export default LowStockBanner;
