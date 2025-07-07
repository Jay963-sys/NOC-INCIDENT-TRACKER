import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "60px" : "200px",
          background: "#2c3e50",
          color: "white",
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
            padding: "10px",
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {collapsed ? "☰" : "«"}
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column" }}>
          <SidebarLink
            to="/dashboard"
            icon="📊"
            label="Dashboard"
            collapsed={collapsed}
            active={
              isActive("/dashboard") && location.pathname === "/dashboard"
            }
          />
          <SidebarLink
            to="/dashboard/faults"
            icon="🛠️"
            label="Faults"
            collapsed={collapsed}
            active={isActive("/dashboard/faults")}
          />
          <SidebarLink
            to="/customers"
            icon="🏢"
            label="Customers"
            collapsed={collapsed}
            active={isActive("/customers")}
          />
          <SidebarLink
            to="/users"
            icon="👤"
            label="Users"
            collapsed={collapsed}
            active={isActive("/users")}
          />
        </nav>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div
          style={{
            background: "#fff",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>
            NOC Fault Logger Admin
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "20px",
            backgroundColor: "#ecf0f1",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, collapsed, active }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 15px",
        backgroundColor: active ? "#007bff" : "transparent",
        color: active ? "white" : "white",
        textDecoration: "none",
        whiteSpace: "nowrap",
        fontWeight: active ? "bold" : "normal",
        transition: "background-color 0.2s",
      }}
    >
      <span style={{ marginRight: collapsed ? "0" : "10px" }}>{icon}</span>
      {!collapsed && label}
    </Link>
  );
}
