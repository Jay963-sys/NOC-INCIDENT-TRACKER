import { useEffect, useState } from "react";
import api from "../services/api";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";

export default function DepartmentFaultsPage() {
  const [faults, setFaults] = useState([]);
  const [selectedFault, setSelectedFault] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    fetchFaults();
    // eslint-disable-next-line
  }, [search, statusFilter, severityFilter]);

  const fetchFaults = async () => {
    const params = {
      search,
      status: statusFilter !== "all" ? statusFilter : undefined,
      severity: severityFilter !== "all" ? severityFilter : undefined,
    };

    const res = await api.get("/faults/department/dashboard", { params });
    setFaults(res.data);
  };

  const handleStatusChange = async (e, faultId) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    try {
      await api.put(`/faults/${faultId}`, { status: newStatus });
      setFaults((prev) =>
        prev.map((f) => (f.id === faultId ? { ...f, status: newStatus } : f))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Department Faults</h2>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by Ticket #, Company, Description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="all">All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="all">All Severity</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>

      {/* Faults Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={thStyle}>Ticket #</th>
            <th style={thStyle}>Company</th>
            <th style={thStyle}>Circuit ID</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Severity</th>
            <th style={thStyle}>Pending</th>
            <th style={thStyle}>Logged Time</th>
            <th style={thStyle}>Resolved At</th>
            <th style={thStyle}>Closed At</th>
          </tr>
        </thead>
        <tbody>
          {faults.map((fault) => (
            <tr
              key={fault.id}
              onClick={() => setSelectedFault(fault)}
              style={{ cursor: "pointer", borderBottom: "1px solid #ccc" }}
            >
              <td style={tdStyle}>{fault.ticket_number || fault.id}</td>
              <td style={tdStyle}>{fault.customer?.company || "-"}</td>
              <td style={tdStyle}>{fault.customer?.circuit_id || "-"}</td>
              <td style={tdStyle}>{fault.type || "-"}</td>
              <td style={tdStyle}>{fault.description}</td>
              <td style={tdStyle}>{fault.location || "-"}</td>
              <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                <select
                  value={fault.status}
                  onChange={(e) => handleStatusChange(e, fault.id)}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </td>
              <td style={tdStyle}>
                <span style={severityBadge(String(fault.severity))}>
                  {fault.severity || "-"}
                </span>
              </td>
              <td style={tdStyle}>
                {typeof fault.pending_hours === "number"
                  ? `${fault.pending_hours.toFixed(1)}h`
                  : "-"}
              </td>
              <td style={tdStyle}>{formatDateTime(fault.createdAt)}</td>
              <td style={tdStyle}>{formatDateTime(fault.resolvedAt)}</td>
              <td style={tdStyle}>{formatDateTime(fault.closedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedFault && (
        <FaultDetailsDrawer
          fault={selectedFault}
          onClose={() => setSelectedFault(null)}
        />
      )}
    </div>
  );
}

// Styles and Helpers
const thStyle = { padding: "10px", textAlign: "left" };
const tdStyle = { padding: "10px" };

const inputStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
  flex: 1,
};

const severityBadge = (severity) => {
  const colors = {
    Low: "#28a745",
    Medium: "#ffc107",
    High: "#fd7e14",
    Critical: "#dc3545",
  };
  return {
    backgroundColor: colors[severity] || "#ccc",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
  };
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";
