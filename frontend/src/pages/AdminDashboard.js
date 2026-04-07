import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff"
  });

  const [editId, setEditId] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  const adminId = localStorage.getItem("userId");

  useEffect(() => {
    fetchData();
    fetchUserInfo();
  }, []);

  const fetchData = async () => {
    const summaryRes = await axios.get("https://inventory-management-pknh.onrender.com/api/orders/summary");
    const usersRes = await axios.get("https://inventory-management-pknh.onrender.com/api/auth/users");

    setSummary(summaryRes.data);
    setUsers(usersRes.data);
  };

  const fetchUserInfo = async () => {
    const res = await axios.get(`https://inventory-management-pknh.onrender.com/api/auth/user/${adminId}`);
    setUserInfo(res.data);
  };

  const handleAddUser = async () => {
    await axios.post("https://inventory-management-pknh.onrender.com/api/auth/register", form);
    alert("Added!");
    setForm({ name: "", email: "", password: "", role: "staff" });
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(`https://inventory-management-pknh.onrender.com/api/auth/${id}`);
    fetchData();
  };

  const handleEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role
    });
    setEditId(u._id);
  };

  const handleUpdate = async () => {
    await axios.put(`https://inventory-management-pknh.onrender.com/api/auth/${editId}`, form);
    setEditId(null);
    setForm({ name: "", email: "", password: "", role: "staff" });
    fetchData();
  };

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="header">
        <h2>Admin Dashboard</h2>

        <div className="header-right">
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>🔔</button>
          <button className="icon-btn" onClick={() => setShowProfile(!showProfile)}>👤</button>

          <button className="logout" onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}>
            Logout
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <p><b>{userInfo.name}</b></p>
              <p>{userInfo.email}</p>
            </div>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-item">Admin panel active</div>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <h3>Business Summary</h3>
      <div className="summary-container">
        <div className="summary-box">
          <h3>Products</h3>
          <p className="value">{summary.totalProducts}</p>
        </div>
        <div className="summary-box">
          <h3>Orders</h3>
          <p className="value">{summary.totalOrders}</p>
        </div>
        <div className="summary-box">
          <h3>Revenue</h3>
          <p className="value">${summary.totalRevenue}</p>
        </div>
      </div>

      {/* ADD USER */}
      <h3>Add Staff / Admin</h3>
      <div className="admin-form">
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <div className="admin-actions">
          <select value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {editId ? (
            <>
              <button onClick={handleUpdate}>Update</button>
              <button onClick={() => setEditId(null)}>Cancel</button>
            </>
          ) : (
            <button onClick={handleAddUser}>Add</button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <h3>User Management</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button className="btn" onClick={() => handleEdit(u)}>Edit</button>
                <button className="btn delete" onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default AdminDashboard;