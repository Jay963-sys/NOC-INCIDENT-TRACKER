import { useState, useEffect } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    department_id: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
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

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("Username, email, and password are required.");
      return;
    }

    try {
      await api.post("/users", {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        department_id: newUser.department_id || null,
      });
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "user",
        department_id: "",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to create user.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>User Management</h2>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>Create New User</h3>
        {error && <p className="error-text">{error}</p>}
        <form
          onSubmit={handleCreateUser}
          style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
        >
          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={newUser.username}
            onChange={handleInputChange}
            style={{ flex: "1", padding: "8px" }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={newUser.email}
            onChange={handleInputChange}
            style={{ flex: "1", padding: "8px" }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={newUser.password}
            onChange={handleInputChange}
            style={{ flex: "1", padding: "8px" }}
          />
          <select
            name="role"
            value={newUser.role}
            onChange={handleInputChange}
            style={{ flex: "1", padding: "8px" }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            name="department_id"
            value={newUser.department_id}
            onChange={handleInputChange}
            style={{ flex: "1", padding: "8px" }}
          >
            <option value="">No Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button className="primary-btn" type="submit">
            Add User
          </button>
        </form>
      </div>

      <div
        style={{ background: "white", padding: "20px", borderRadius: "8px" }}
      >
        <h3>All Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.Department ? u.Department.name : "N/A"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
