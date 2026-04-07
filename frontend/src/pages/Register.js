import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const API_BASE =
    process.env.REACT_APP_API_URL || "https://inventory-management-pknh.onrender.com";

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, form);
      alert(res.data.message);
      setForm({ name: "", email: "", password: "", role: "user" });
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={handleRegister}>Register</button>
        <p onClick={() => navigate("/")} style={{ cursor: "pointer", textAlign: "center", marginTop: "10px" }}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default Register;