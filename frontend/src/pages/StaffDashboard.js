import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", cost: "", stock: "" });
  const [editId, setEditId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  const staffId = localStorage.getItem("userId");

  useEffect(() => {
    fetchData();
    fetchUserInfo();
  }, []);

  const fetchData = async () => {
    const orderRes = await axios.get("https://inventory-management-pknh.onrender.com/api/orders");
    const prodRes = await axios.get("https://inventory-management-pknh.onrender.com/api/products");

    setOrders(orderRes.data.filter(o => o.status === "Pending"));
    setAllOrders(orderRes.data);
    setProducts(prodRes.data);
  };

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`https://inventory-management-pknh.onrender.com/api/auth/user/${staffId}`);
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ STOCK LEVEL FUNCTION
  const getStockLevel = (stock) => {
    if (stock < 10) return "Low";
    if (stock < 50) return "Medium";
    return "High";
  };

  const approveOrder = async (order) => {
    await axios.put("https://inventory-management-pknh.onrender.com/api/orders/approve", {
      orderId: order._id,
      staffId: staffId,
      productId: order.productId._id,
      qty: order.quantity
    });
    alert("Order Approved!");
    fetchData();
  };

  const addProduct = async () => {
    await axios.post("https://inventory-management-pknh.onrender.com/api/products", form);
    alert("Product Added!");
    setForm({ name: "", price: "", cost: "", stock: "" });
    fetchData();
  };

  const updateProduct = async () => {
    await axios.put(`https://inventory-management-pknh.onrender.com/api/products/${editId}`, form);
    alert("Product Updated!");
    setForm({ name: "", price: "", cost: "", stock: "" });
    setEditId(null);
    fetchData();
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await axios.delete(`https://inventory-management-pknh.onrender.com/api/products/${id}`);
      alert("Product Deleted!");
      fetchData();
    }
  };

  const editProduct = (p) => {
    setForm({ name: p.name, price: p.price, cost: p.price, stock: p.stock });
    setEditId(p._id);
  };

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="header">
        <h2>Staff Dashboard</h2>
        <div className="header-right">

          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {orders.length > 0 && <span className="notification-badge">{orders.length}</span>}
          </button>

          <button className="icon-btn" onClick={() => setShowProfile(!showProfile)}>👤</button>

          <button className="logout" onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}>
            Logout
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> Staff</p>
            </div>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              {orders.length > 0 ? (
                <div className="notification-item">{orders.length} order(s) pending</div>
              ) : (
                <div className="notification-item">No pending orders</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PENDING ORDERS */}
      <h3>Pending Orders ({orders.length})</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o.userId?.name}</td>
              <td>{o.productId?.name}</td>
              <td>{o.quantity}</td>
              <td>${o.totalAmount}</td>
              <td>
                <button className="btn approve" onClick={() => approveOrder(o)}>
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PRODUCT FORM */}
      <h3>Manage Products</h3>
      <div className="product-form">
        <input
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value, cost: e.target.value })}
        />
        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        {editId ? (
          <>
            <button className="btn approve" onClick={updateProduct}>Update</button>
            <button className="btn" onClick={() => {
              setEditId(null);
              setForm({ name: "", price: "", cost: "", stock: "" });
            }}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn approve" onClick={addProduct}>Add Product</button>
        )}
      </div>

      {/* PRODUCTS TABLE WITH STATUS */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>

              {/* ✅ STATUS COLUMN */}
              <td>
                <span className={`status-badge ${getStockLevel(p.stock).toLowerCase()}`}>
                  {getStockLevel(p.stock)}
                </span>
              </td>

              <td>
                <button className="btn" onClick={() => editProduct(p)}>Edit</button>
                <button className="btn delete" onClick={() => deleteProduct(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ORDER HISTORY */}
      <h3>Order History</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Return Reason</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {allOrders.map(o => (
            <tr key={o._id}>
              <td>{o.userId?.name}</td>
              <td>{o.productId?.name}</td>
              <td>{o.quantity}</td>
              <td>${o.totalAmount}</td>
              <td>
                <span className={`status-badge ${o.status.toLowerCase()}`}>
                  {o.status}
                </span>
              </td>
              <td>{o.returnReason || "-"}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default StaffDashboard;