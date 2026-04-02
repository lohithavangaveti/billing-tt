import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Cannot connect to server");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>💼 SmartBiz</h2>
        <p>Login to your account</p>

        {error && <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        <p style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
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
  borderRadius: "8px",
  cursor: "pointer"
};

export default Login;