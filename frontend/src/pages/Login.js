import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import "./Auth.css";

function Login() {
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_URL || "https://inventory-management-pknh.onrender.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const wakeBackend = async () => {
    try {
      await axios.get(`${API_BASE}/`, { timeout: 15000 });
    } catch (err) {
      console.log("Wake backend error:", err.message);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      await wakeBackend();

      const res = await axios.post(
        `${API_BASE}/api/auth/login/${role}`,
        {
          email: form.email,
          password: form.password
        },
        { timeout: 20000 }
      );

      alert(res.data.message || "Login Successful");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("role", res.data.role);

      setTimeout(() => {
        if (res.data.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (res.data.role === "staff") {
          window.location.href = "/staff-dashboard";
        } else {
          window.location.href = "/user-dashboard";
        }
      }, 1500);
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inventory Login</h2>

        <div className="tabs">
          <button
            className={role === "user" ? "active" : ""}
            onClick={() => setRole("user")}
          >
            User
          </button>

          <button
            className={role === "staff" ? "active" : ""}
            onClick={() => setRole("staff")}
          >
            Staff
          </button>

          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
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

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>

        {role === "user" && (
          <p style={{ marginTop: "10px", textAlign: "center" }}>
            No account?{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => {
                window.location.href = "/register";
              }}
            >
              Register
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;