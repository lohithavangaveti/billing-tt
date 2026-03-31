import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      alert("Login Successful");
      navigate("/dashboard");
    } else {
      alert("User not found. Please register.");
      navigate("/register");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>💼 SmartBiz</h2>
        <p>Login to your account</p>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        {/* 🔁 REGISTER LINK */}
        <p style={{ marginTop: "15px" }}>
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")} style={linkStyle}>
            Register
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
  background: "linear-gradient(135deg,#b96747bf, #b96747bf)"
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
  border: "1px solid #915252ff"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "8px"
};

export default Login;