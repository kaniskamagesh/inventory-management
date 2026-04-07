import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchData();
    fetchUserInfo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    // eslint-disable-next-line
  }, [products, searchTerm, sortBy]);

  const fetchData = async () => {
    const prodRes = await axios.get("https://inventory-management-pknh.onrender.com/api/products");
    const orderRes = await axios.get(`https://inventory-management-pknh.onrender.com/api/orders/user/${userId}`);
    setProducts(prodRes.data);
    setMyOrders(orderRes.data);
  };

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`https://inventory-management-pknh.onrender.com/api/auth/user/${userId}`);
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "stock") return b.stock - a.stock;
      return 0;
    });

    setFilteredProducts(filtered);
  };

  const getStockLevel = (stock) => {
    if (stock < 10) return "Low";
    if (stock < 50) return "Medium";
    return "High";
  };

  const addToCart = (p, qty) => {
    if (!qty || qty < 1) return alert("Please enter valid quantity");
    if (qty > p.stock) return alert("Not enough stock available");

    const existing = cart.find((item) => item._id === p._id);
    if (existing) {
      setCart(cart.map((item) => item._id === p._id ? { ...item, qty: item.qty + qty } : item));
    } else {
      setCart([...cart, { ...p, qty }]);
    }
    alert(`Added ${qty} item(s) to cart!`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const checkout = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    for (let item of cart) {
      await axios.post("https://inventory-management-pknh.onrender.com/api/orders/buy", {
        productId: item._id,
        userId: userId,
        quantity: item.qty,
        price: item.price
      });
    }

    alert("Orders Placed! Waiting for Staff Approval.");
    setCart([]);
    fetchData();
  };

  const handleReturn = async (orderId) => {
    const reason = prompt("Please enter return reason:");
    if (!reason) return alert("Return reason is required");

    try {
      await axios.put(`https://inventory-management-pknh.onrender.com/api/orders/return/${orderId}`, { reason });
      alert("Return successful!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Return failed");
    }
  };

  const pendingOrders = myOrders.filter((o) => o.status === "Pending").length;

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>User Dashboard</h2>
        <div className="header-right">
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {pendingOrders > 0 && <span className="notification-badge">{pendingOrders}</span>}
          </button>
          <button className="icon-btn" onClick={() => setShowProfile(!showProfile)}>👤</button>
          <button className="logout" onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
            Logout
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> User</p>
            </div>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <h4 style={{ margin: "0 0 10px 0" }}>Notifications</h4>
              {pendingOrders > 0 ? (
                <div className="notification-item">You have {pendingOrders} pending order(s) awaiting approval</div>
              ) : (
                <div className="notification-item">No new notifications</div>
              )}
            </div>
          )}
        </div>
      </div>

      <h3>Available Products</h3>
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="stock">Stock: High to Low</option>
        </select>
      </div>

      <div className="product-card-container">
        {filteredProducts.map((p) => (
          <div key={p._id} className={`product-card ${getStockLevel(p.stock).toLowerCase()}`}>
            <h3>{p.name}</h3>
            <p className="price">${p.price}</p>
            <p>Stock: {p.stock} ({getStockLevel(p.stock)})</p>
            <input
              type="number"
              min="1"
              max={p.stock}
              defaultValue="1"
              id={`qty-${p._id}`}
              className="qty-input"
            />
            <button
              className="btn buy"
              onClick={() => {
                const qty = parseInt(document.getElementById(`qty-${p._id}`).value);
                addToCart(p, qty);
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h3>Shopping Cart ({cart.length})</h3>
      {cart.length > 0 && (
        <div className="cart-section">
          <table className="table">
            <thead>
              <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th>Action</th></tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>{item.qty}</td>
                  <td>${item.price * item.qty}</td>
                  <td><button className="btn delete" onClick={() => removeFromCart(item._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="checkout-btn">
            <button className="btn approve" onClick={checkout}>
              Checkout (${cart.reduce((sum, item) => sum + (item.price * item.qty), 0)})
            </button>
          </div>
        </div>
      )}

      <h3>Order History</h3>
      <table className="table">
        <thead>
          <tr><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr>
        </thead>
        <tbody>
          {myOrders.map((o) => (
            <tr key={o._id}>
              <td>{o.productId?.name}</td>
              <td>{o.quantity}</td>
              <td>${o.totalAmount}</td>
              <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>
                {o.status === "approved" && (
                  <button className="btn" onClick={() => handleReturn(o._id)}>Return (24h)</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserDashboard;