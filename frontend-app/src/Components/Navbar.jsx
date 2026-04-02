import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
      background: "linear-gradient(90deg, #3b20b0b5, #3b20b0b5)",
      padding: "12px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "white"
    }}>

      {/* LOGO */}
      <h2 style={{ margin: 0, fontWeight: "bold" }}>
        💼 SmartBiz
      </h2>

      {/* LINKS */}

    </nav>
  );
}

const linkStyle = {
  color: "white",
  marginLeft: "20px",
  textDecoration: "none",
  fontWeight: "500"
};

export default Navbar;