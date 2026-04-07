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