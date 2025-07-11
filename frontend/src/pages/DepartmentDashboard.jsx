import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";

export default function DepartmentDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [faults, setFaults] = useState([]);
  const [selectedFault, setSelectedFault] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const fetchFaults = useCallback(async () => {
    const params = { search, status: statusFilter, severity: severityFilter };
    const res = await api.get("/faults/department/dashboard", { params });
    setFaults(res.data);
  }, [search, statusFilter, severityFilter]);

  const fetchMetrics = async () => {
    const res = await api.get("/faults/department/charts");
    const statusCounts = {};
    const severityCounts = {};

    res.data.status?.forEach((s) => {
      statusCounts[s.status] = s.count;
    });

    const normalizedSeverityData = res.data.severity?.map((s) => {
      const normalizedKey =
        s.severity?.charAt(0).toUpperCase() +
        s.severity?.slice(1).toLowerCase();
      severityCounts[normalizedKey] = s.count;
      return {
        severity: normalizedKey,
        count: s.count,
      };
    });

    setMetrics({ statusCounts, severityCounts });
    setChartsData({ ...res.data, severity: normalizedSeverityData });
  };

  useEffect(() => {
    fetchMetrics();
    fetchFaults();
  }, [fetchFaults]);

  const handleStatusChange = async (e, fault) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    try {
      const res = await api.put(`/faults/${fault.id}`, {
        status: newStatus,
        note: `Status updated to ${newStatus}`,
      });

      toast.success(`Fault marked as ${newStatus}`);

      // Refresh list
      fetchFaults();
      fetchMetrics();

      // If drawer is open, update it too
      if (selectedFault?.id === fault.id) {
        setSelectedFault(res.data.fault);
      }
    } catch (err) {
      toast.error("Failed to update fault status");
      console.error("Status update error", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Department Dashboard</h2>

      {/* 🔹 Status Metrics */}
      {metrics && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          {["Open", "In Progress", "Resolved", "Closed"].map((status) => (
            <MetricCard
              key={status}
              label={status}
              value={metrics.statusCounts[status] || 0}
            />
          ))}
        </div>
      )}

      {/* 🔹 Severity Metrics */}
      {metrics && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          {["Low", "Medium", "High", "Critical"].map((severity) => (
            <MetricCard
              key={severity}
              label={`Severity: ${severity}`}
              value={metrics.severityCounts[severity] || 0}
            />
          ))}
        </div>
      )}

      {/* 🔹 Severity Chart */}
      {chartsData?.severity?.length > 0 && (
        <div style={{ flex: 1, marginBottom: "40px" }}>
          <h4>Faults by Severity</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartsData.severity}>
              <XAxis dataKey="severity" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 🔹 Filters */}
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

      {/* 🔹 Faults Table */}
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
                  onChange={(e) => handleStatusChange(e, fault)}
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
        <div
          className="drawer-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("drawer-overlay")) {
              setSelectedFault(null); // close drawer if clicked outside
            }
          }}
        >
          <FaultDetailsDrawer
            fault={selectedFault}
            onClose={() => setSelectedFault(null)}
            refreshTable={fetchFaults}
          />
        </div>
      )}
    </div>
  );
}

// 🔹 Helpers and styles

const MetricCard = ({ label, value }) => (
  <div
    style={{
      flex: 1,
      background: "#f0f4ff",
      padding: "16px",
      borderRadius: "8px",
      textAlign: "center",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ fontSize: "14px", color: "#555" }}>{label}</div>
    <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
      {value}
    </div>
  </div>
);

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
