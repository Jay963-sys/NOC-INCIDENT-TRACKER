import { useState, useEffect } from "react";
import api from "../services/api";
import NewCustomerForm from "../components/NewCustomerForm";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Customer Management</h2>
        <button className="primary-btn" onClick={() => setShowNewForm(true)}>
          + Add New Customer
        </button>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Circuit ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.company}</td>
                <td>{c.circuit_id}</td>
                <td>{c.type}</td>
                <td>{c.location}</td>
                <td>{c.owner}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showNewForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Customer</h3>
            <NewCustomerForm
              onSuccess={() => {
                fetchCustomers();
                setShowNewForm(false);
              }}
            />
            <button
              className="secondary-btn"
              onClick={() => setShowNewForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
