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
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "64px" : "220px",
          background: "#3b4252",
          color: "#3b4252",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
            }}
            title="Toggle sidebar"
          >
            {collapsed ? "☰" : "«"}
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <SidebarLink
            to="/dashboard"
            icon="📊"
            label="Dashboard"
            collapsed={collapsed}
            active={location.pathname === "/dashboard"}
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
          <SidebarLink
            to="/departments"
            icon="🏬"
            label="Departments"
            collapsed={collapsed}
            active={isActive("/departments")}
          />
        </nav>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div
          style={{
            background: "#f0f0ff",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}
          >
            NOC Fault Logger Admin
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#f8f8ff",
            display: "flex",
            flexDirection: "column",
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
      title={collapsed ? label : ""}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: active ? "#2563eb" : "transparent",
        color: active ? "#fff" : "#e2e8f0",
        textDecoration: "none",
        fontWeight: active ? "600" : "400",
        borderRadius: "6px",
        margin: "0 8px",
        transition: "background-color 0.2s ease",
      }}
    >
      <span style={{ marginRight: collapsed ? "0" : "10px", fontSize: "16px" }}>
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
