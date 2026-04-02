function Card({ title, value, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      flex: 1,
      textAlign: "center",
      cursor: onClick ? "pointer" : "default"
    }}>
      <h4 style={{ color: "#777" }}>{title}</h4>
      <h2 style={{ marginTop: "10px", color: "#2c3e50" }}>{value}</h2>
    </div>
  );
}

export default Card;