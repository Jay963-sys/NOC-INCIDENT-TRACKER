import { useState, useEffect } from "react";
import api from "../services/api";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [editDept, setEditDept] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch departments.");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      await api.post("/departments", { name: newDeptName });
      setNewDeptName("");
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Failed to add department.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete department.");
    }
  };

  const handleEdit = (dept) => {
    setEditDept(dept.id);
    setEditName(dept.name);
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/departments/${id}`, { name: editName });
      setEditDept(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Failed to update department.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Department Management</h2>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>Add New Department</h3>
        <form
          onSubmit={handleAddDepartment}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="Department Name"
            style={{ flex: 1, padding: "8px" }}
          />
          <button className="primary-btn" type="submit">
            Add
          </button>
        </form>
      </div>

      <div
        style={{ background: "white", padding: "20px", borderRadius: "8px" }}
      >
        <h3>All Departments</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>
                  {editDept === dept.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ padding: "6px", width: "100%" }}
                    />
                  ) : (
                    dept.name
                  )}
                </td>
                <td>
                  {editDept === dept.id ? (
                    <>
                      <button
                        className="primary-btn"
                        onClick={() => handleUpdate(dept.id)}
                        style={{ marginRight: "6px" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditDept(null)}
                        style={{
                          background: "gray",
                          color: "white",
                          padding: "6px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(dept)}
                        style={{ marginRight: "6px" }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(dept.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
