import { useState, useEffect } from "react";
import api from "../services/api";
import NewFaultForm from "../components/NewFaultForm";
import FaultList from "../components/FaultList";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";

export default function Dashboard() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedFault, setSelectedFault] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [showNewFaultModal, setShowNewFaultModal] = useState(false);

  const fetchFaults = async ({
    status = activeTab,
    department = departmentFilter,
    severity = severityFilter,
    search = searchTerm,
  } = {}) => {
    try {
      setLoading(true);

      const params = {
        status: status.toLowerCase() === "all" ? "all" : status,
        department_id:
          department === "All" ? "all" : getDepartmentId(department),
        severity: severity === "All" ? "all" : severity,
        search: search.trim() || undefined,
      };

      const res = await api.get("/faults", { params });
      setFaults(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch faults");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaults();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchFaults();
    // eslint-disable-next-line
  }, [activeTab, departmentFilter, severityFilter, searchTerm]);

  const handleRowClick = (fault) => {
    setSelectedFault(fault);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>All Faults</h2>
        <button onClick={() => setShowNewFaultModal(true)} style={buttonStyle}>
          + Log New Fault
        </button>
      </div>

      {/* Status Tabs */}
      <div style={tabContainerStyle}>
        {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeTab === tab ? "#007bff" : "#e0e0e0",
              color: activeTab === tab ? "white" : "black",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={filterContainerStyle}>
        <input
          type="text"
          placeholder="Search by Ticket, Description, Company, Circuit ID, or Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="All">All Departments</option>
          <option value="Field Engineers">Field Engineers</option>
          <option value="NOC">NOC</option>
          <option value="Service Delivery">Service Delivery</option>
          <option value="Network Department">Network Department</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="All">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Fault Table */}
      {loading ? (
        <p>Loading faults...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <FaultList
          faults={faults}
          onRowClick={handleRowClick}
          onRefresh={fetchFaults}
        />
      )}

      {/* Fault Details Drawer */}
      <FaultDetailsDrawer
        fault={selectedFault}
        onClose={() => setSelectedFault(null)}
      />

      {/* New Fault Modal */}
      {showNewFaultModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Log New Fault</h3>
            <NewFaultForm
              onSuccess={() => {
                fetchFaults();
                setShowNewFaultModal(false);
              }}
            />
            <button
              onClick={() => setShowNewFaultModal(false)}
              style={{
                ...buttonStyle,
                backgroundColor: "gray",
                marginTop: "10px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const getDepartmentId = (name) => {
  switch (name) {
    case "NOC":
      return 1;
    case "Field Engineers":
      return 2;
    case "Service Delivery":
      return 3;
    case "Network Department":
      return 4;
    default:
      return "all";
  }
};

const containerStyle = {
  padding: "20px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const tabContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const tabButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const filterContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: "8px",
  flex: "1",
  minWidth: "200px",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "400px",
  boxShadow: "0 0 10px rgba(0,0,0,0.25)",
};
