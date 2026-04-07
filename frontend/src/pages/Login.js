import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const API_BASE =
    process.env.REACT_APP_API_URL || "https://inventory-management-pknh.onrender.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login/${role}`, {
        email: form.email,
        password: form.password
      });

      alert(res.data.message);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") navigate("/admin-dashboard");
      else if (res.data.role === "staff") navigate("/staff-dashboard");
      else navigate("/user-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inventory Login</h2>

        <div className="tabs">
          <button className={role === "user" ? "active" : ""} onClick={() => setRole("user")}>User</button>
          <button className={role === "staff" ? "active" : ""} onClick={() => setRole("staff")}>Staff</button>
          <button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>Admin</button>
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button onClick={handleLogin}>Login</button>

        {role === "user" && (
          <p style={{ marginTop: "10px", textAlign: "center" }}>
            No account?{" "}
            <span style={{ color: "blue", cursor: "pointer" }} onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;