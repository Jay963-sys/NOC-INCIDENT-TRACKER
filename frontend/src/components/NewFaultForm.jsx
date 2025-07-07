import { useState, useEffect } from "react";
import api from "../services/api";

export default function NewFaultForm({ onSuccess }) {
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
    fetchDepartments();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !description ||
      !type ||
      !location ||
      !owner ||
      !customerId ||
      !assignedToId
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      await api.post("/faults", {
        description,
        type,
        location,
        owner,
        status: "Open",
        customer_id: customerId,
        assigned_to_id: assignedToId,
        pending_hours: 0, // Send pending_hours explicitly so severity gets calculated
      });

      setDescription("");
      setType("");
      setLocation("");
      setOwner("");
      setAssignedToId("");
      setCustomerId("");
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to create fault.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Description *"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Type *"
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Location *"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Owner *"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        style={inputStyle}
      />

      <select
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select Department *</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select Customer *</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.company} - {c.circuit_id}
          </option>
        ))}
      </select>

      <button type="submit" style={buttonStyle}>
        Log Fault
      </button>
    </form>
  );
}

const inputStyle = {
  display: "block",
  marginBottom: "10px",
  width: "100%",
  padding: "8px",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
