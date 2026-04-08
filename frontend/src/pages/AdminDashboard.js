import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function AdminDashboard() {
  const API_BASE =
    process.env.REACT_APP_API_URL || "https://inventory-management-pknh.onrender.com";

  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    orders: []
  });

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
  const [loading, setLoading] = useState(true);

  const adminId = localStorage.getItem("userId");

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      await fetchData();
      await fetchUserInfo();
    } catch (err) {
      console.error("INITIAL ADMIN LOAD ERROR:", err.response?.data || err.message);

      setTimeout(async () => {
        try {
          await fetchData();
          await fetchUserInfo();
        } catch (e) {
          console.error("ADMIN RETRY ERROR:", e.response?.data || e.message);
        } finally {
          setLoading(false);
        }
      }, 2500);

      return;
    }

    setLoading(false);
  };

  const fetchData = async () => {
    const summaryRes = await axios.get(`${API_BASE}/api/orders/summary`);
    const usersRes = await axios.get(`${API_BASE}/api/auth/users`);

    setSummary(summaryRes.data || {});
    setUsers(usersRes.data || []);
  };

  const fetchUserInfo = async () => {
    if (!adminId) return;
    const res = await axios.get(`${API_BASE}/api/auth/user/${adminId}`);
    setUserInfo(res.data || {});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    try {
      if (!form.name || !form.email || !form.password || !form.role) {
        alert("Please fill all fields");
        return;
      }

      const res = await axios.post(`${API_BASE}/api/auth/register`, form);
      alert(res.data?.message || "User added successfully");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "staff"
      });

      await fetchData();
    } catch (err) {
      console.error("ADD USER ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Delete this user?")) return;

      await axios.delete(`${API_BASE}/api/auth/${id}`);
      alert("User deleted");
      await fetchData();
    } catch (err) {
      console.error("DELETE USER ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEdit = (u) => {
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "staff"
    });
    setEditId(u._id);
  };

  const handleUpdate = async () => {
    try {
      if (!form.name || !form.email || !form.role) {
        alert("Please fill required fields");
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        role: form.role
      };

      if (form.password) {
        payload.password = form.password;
      }

      await axios.put(`${API_BASE}/api/auth/${editId}`, payload);

      alert("User updated");
      setEditId(null);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "staff"
      });

      await fetchData();
    } catch (err) {
      console.error("UPDATE USER ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Admin Dashboard</h2>

        <div className="header-right">
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </button>

          <button
            className="icon-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            👤
          </button>

          <button
            className="logout"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <p><b>{userInfo.name}</b></p>
              <p>{userInfo.email}</p>
              <p>{userInfo.role}</p>
            </div>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-item">Admin panel active</div>
              <div className="notification-item">Total users: {users.length}</div>
            </div>
          )}
        </div>
      </div>

      {loading && <p>Loading dashboard data...</p>}

      <h3>Business Summary</h3>
      <div className="summary-container">
        <div className="summary-box">
          <h3>Products</h3>
          <p className="value">{summary.totalProducts || 0}</p>
        </div>

        <div className="summary-box">
          <h3>Orders</h3>
          <p className="value">{summary.totalOrders || 0}</p>
        </div>

        <div className="summary-box">
          <h3>Revenue</h3>
          <p className="value">${summary.totalRevenue || 0}</p>
        </div>
      </div>

      <h3>{editId ? "Update User" : "Add User / Staff"}</h3>
      <div
        className="search-sort-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
          gap: "12px"
        }}
      >
        <input
          className="search-input"
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="search-input"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="search-input"
          type="password"
          name="password"
          placeholder={editId ? "New Password (optional)" : "Password"}
          value={form.password}
          onChange={handleChange}
        />

        <select
          className="sort-select"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {editId ? (
          <button className="btn approve" onClick={handleUpdate}>
            Update
          </button>
        ) : (
          <button className="btn approve" onClick={handleAddUser}>
            Add
          </button>
        )}
      </div>

      {editId && (
        <div style={{ marginTop: "10px" }}>
          <button
            className="btn delete"
            onClick={() => {
              setEditId(null);
              setForm({
                name: "",
                email: "",
                password: "",
                role: "staff"
              });
            }}
          >
            Cancel Edit
          </button>
        </div>
      )}

      <h3>Users List</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th style={{ minWidth: "180px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="btn approve"
                    style={{ marginRight: "8px" }}
                    onClick={() => handleEdit(u)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn delete"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Approved Orders</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Verified By</th>
          </tr>
        </thead>
        <tbody>
          {summary.orders && summary.orders.length > 0 ? (
            summary.orders.map((o) => (
              <tr key={o._id}>
                <td>{o.userId?.name || "-"}</td>
                <td>{o.productId?.name || "-"}</td>
                <td>{o.quantity}</td>
                <td>${o.totalAmount}</td>
                <td>{o.verifiedBy?.name || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No approved orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;