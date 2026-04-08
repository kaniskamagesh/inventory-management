import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function StaffDashboard() {
  const API_BASE =
    process.env.REACT_APP_API_URL || "https://inventory-management-pknh.onrender.com";

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    cost: "",
    stock: ""
  });
  const [editId, setEditId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  const staffId = localStorage.getItem("userId");

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
      console.error("INITIAL STAFF LOAD ERROR:", err.response?.data || err.message);

      setTimeout(async () => {
        try {
          await fetchData();
          await fetchUserInfo();
        } catch (e) {
          console.error("STAFF RETRY ERROR:", e.response?.data || e.message);
        } finally {
          setLoading(false);
        }
      }, 2500);

      return;
    }

    setLoading(false);
  };

  const fetchData = async () => {
    const orderRes = await axios.get(`${API_BASE}/api/orders`);
    const prodRes = await axios.get(`${API_BASE}/api/products`);

    setOrders(orderRes.data.filter((o) => o.status === "Pending"));
    setAllOrders(orderRes.data);
    setProducts(prodRes.data);
  };

  const fetchUserInfo = async () => {
    if (!staffId) return;

    const res = await axios.get(`${API_BASE}/api/auth/user/${staffId}`);
    setUserInfo(res.data || {});
  };

  const getStockLevel = (stock) => {
    if (stock < 10) return "Low";
    if (stock < 50) return "Medium";
    return "High";
  };

  const approveOrder = async (order) => {
    try {
      await axios.put(`${API_BASE}/api/orders/approve`, {
        orderId: order._id,
        staffId: staffId,
        productId: order.productId._id,
        qty: order.quantity
      });
      alert("Order Approved!");
      await fetchData();
    } catch (err) {
      console.error("APPROVE ORDER ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to approve order");
    }
  };

  const addProduct = async () => {
    try {
      if (!form.name || !form.price || !form.cost || !form.stock) {
        alert("Please fill all product fields");
        return;
      }

      await axios.post(`${API_BASE}/api/products`, {
        name: form.name,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock)
      });

      alert("Product Added!");
      setForm({ name: "", price: "", cost: "", stock: "" });
      await fetchData();
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add product");
    }
  };

  const updateProduct = async () => {
    try {
      if (!form.name || !form.price || !form.cost || !form.stock) {
        alert("Please fill all product fields");
        return;
      }

      await axios.put(`${API_BASE}/api/products/${editId}`, {
        name: form.name,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock)
      });

      alert("Product Updated!");
      setForm({ name: "", price: "", cost: "", stock: "" });
      setEditId(null);
      await fetchData();
    } catch (err) {
      console.error("UPDATE PRODUCT ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update product");
    }
  };

  const deleteProduct = async (id) => {
    try {
      if (!window.confirm("Delete this product?")) return;

      await axios.delete(`${API_BASE}/api/products/${id}`);
      alert("Product Deleted!");
      await fetchData();
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const editProduct = (p) => {
    setForm({
      name: p.name || "",
      price: p.price || "",
      cost: p.cost || "",
      stock: p.stock || ""
    });
    setEditId(p._id);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Staff Dashboard</h2>
        <div className="header-right">
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {orders.length > 0 && (
              <span className="notification-badge">{orders.length}</span>
            )}
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
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> Staff</p>
            </div>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              {orders.length > 0 ? (
                <div className="notification-item">
                  {orders.length} order(s) pending
                </div>
              ) : (
                <div className="notification-item">No pending orders</div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && <p>Loading dashboard data...</p>}

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
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o._id}>
                <td>{o.userId?.name}</td>
                <td>{o.productId?.name}</td>
                <td>{o.quantity}</td>
                <td>${o.totalAmount}</td>
                <td>
                  <button
                    className="btn approve"
                    onClick={() => approveOrder(o)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No pending orders</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>{editId ? "Update Product" : "Add Product"}</h3>
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
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="search-input"
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <input
          className="search-input"
          type="number"
          name="cost"
          placeholder="Cost"
          value={form.cost}
          onChange={handleChange}
        />

        <input
          className="search-input"
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />

        {editId ? (
          <button className="btn approve" onClick={updateProduct}>
            Update
          </button>
        ) : (
          <button className="btn approve" onClick={addProduct}>
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
              setForm({ name: "", price: "", cost: "", stock: "" });
            }}
          >
            Cancel Edit
          </button>
        </div>
      )}

      <h3>Products</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Cost</th>
            <th>Stock</th>
            <th>Stock Level</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>${p.cost}</td>
                <td>{p.stock}</td>
                <td>{getStockLevel(p.stock)}</td>
                <td>
                  <button
                    className="btn approve"
                    style={{ marginRight: "8px" }}
                    onClick={() => editProduct(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn delete"
                    onClick={() => deleteProduct(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No products found</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>All Orders</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Verified By</th>
          </tr>
        </thead>
        <tbody>
          {allOrders.length > 0 ? (
            allOrders.map((o) => (
              <tr key={o._id}>
                <td>{o.userId?.name || "-"}</td>
                <td>{o.productId?.name || "-"}</td>
                <td>{o.quantity}</td>
                <td>${o.totalAmount}</td>
                <td>{o.status}</td>
                <td>{o.verifiedBy?.name || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StaffDashboard;