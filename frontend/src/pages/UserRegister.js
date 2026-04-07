import { useState } from "react";
import axios from "axios";

function UserRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://inventory-management-pknh.onrender.com/api/auth/register", form);
    alert("User Registered");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>User Register</h2>
      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Register</button>
    </form>
  );
}

export default UserRegister;