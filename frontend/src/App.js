import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/user-dashboard" element={<UserDashboard />} />

        <Route path="/staff-dashboard" element={<StaffDashboard />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

      </Routes>

    </Router>
  );
}

export default App;