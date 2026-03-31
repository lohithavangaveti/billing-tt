import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // ❌ Check if user already exists
    const exists = users.find(u => u.email === email);
    if (exists) {
      alert("User already exists. Please login.");
      navigate("/");
      return;
    }

    // ✅ Save new user
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered Successfully");
    navigate("/");
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>💼 SmartBiz</h2>
        <p>Create your account</p>

        <input placeholder="Name" onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

        <button onClick={handleRegister} style={buttonStyle}>
          Register
        </button>

        {/* 🔁 LOGIN LINK */}
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span onClick={() => navigate("/")} style={linkStyle}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const linkStyle = { color: "#4f46e5", cursor: "pointer", fontWeight: "bold" };

const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #b96747bf, #b96747bf)"
};

const cardStyle = {
  background: "#d3d5e16b",
  padding: "80px",
  borderRadius: "90px",
  width: "420px",
  textAlign: "center"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "8px"
};

export default Register;