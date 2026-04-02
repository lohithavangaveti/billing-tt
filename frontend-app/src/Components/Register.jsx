import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("Fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
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
        <p>Create your account</p>

        {error && <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>}

        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRegister()} style={inputStyle} />

        <button onClick={handleRegister} style={buttonStyle}>
          Register
        </button>

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
  borderRadius: "8px",
  cursor: "pointer"
};

export default Register;