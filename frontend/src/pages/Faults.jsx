import { useState, useEffect } from "react";
import api from "../services/api";
import FaultList from "../components/FaultList";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";

export default function Faults() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFault, setSelectedFault] = useState(null);

  const fetchFaults = async () => {
    try {
      const res = await api.get("/faults");
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
  }, []);

  return (
    <div className="page-container">
      <h2>All Faults</h2>

      {loading ? (
        <p>Loading faults...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <FaultList
          faults={faults}
          onRowClick={setSelectedFault}
          onRefresh={fetchFaults}
        />
      )}

      <FaultDetailsDrawer
        fault={selectedFault}
        onClose={() => setSelectedFault(null)}
      />
    </div>
  );
}
