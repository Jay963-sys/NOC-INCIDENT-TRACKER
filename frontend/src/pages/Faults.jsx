import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import FaultList from "../components/FaultList";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";

export default function Faults() {
  const [faults, setFaults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFault, setSelectedFault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const [page, setPage] = useState(1);
  const faultsPerPage = 10;

  const fetchFaults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/faults", {
        params: {
          status: statusFilter,
          severity: severityFilter,
          timeRange: dateRange,
        },
      });
      setFaults(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch faults");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, dateRange]);

  useEffect(() => {
    fetchFaults();
  }, [fetchFaults]);

  useEffect(() => {
    const filteredList = faults.filter(
      (f) =>
        f.customer?.company?.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredList);
    setPage(1); // Reset page on filter change
  }, [search, faults]);

  const paginatedFaults = filtered.slice(
    (page - 1) * faultsPerPage,
    page * faultsPerPage
  );

  const totalPages = Math.ceil(filtered.length / faultsPerPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>All Faults</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search faults..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px", width: "200px" }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px" }}
          >
            <option value="">All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ padding: "6px" }}
          >
            <option value="">All Severities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: "6px" }}
          >
            <option value="all">All Time</option>
            <option value="day">Past 24 hours</option>
            <option value="week">Past 7 days</option>
            <option value="month">Past 30 days</option>
            <option value="year">Past 12 months</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading faults...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <FaultList
            faults={paginatedFaults}
            onRowClick={setSelectedFault}
            onRefresh={fetchFaults}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
              }}
            >
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{ marginRight: "8px" }}
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                style={{ marginLeft: "8px" }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <FaultDetailsDrawer
        fault={selectedFault}
        onClose={() => setSelectedFault(null)}
      />
    </div>
  );
}
