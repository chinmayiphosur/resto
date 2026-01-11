function StatsCard({ title, value, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default StatsCard;
