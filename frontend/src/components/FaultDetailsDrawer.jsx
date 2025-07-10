import { useState, useEffect } from "react";
import api from "../services/api";

export default function FaultDetailsDrawer({ fault, onClose }) {
  const [activeTab, setActiveTab] = useState("Details");
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    if (!fault) return;

    api.get(`/faults/${fault.id}/details`).then((res) => {
      setDetails(res.data.fault);
      setNotes(res.data.notes || []);
    });

    api.get(`/faults/${fault.id}/history`).then((res) => {
      setStatusHistory(res.data || []);
    });

    api.get(`/customers/${fault.customer.id}/history`).then((res) => {
      setHistory(res.data || []);
    });
  }, [fault]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await api.post(`/faults/${fault.id}/notes`, { content: newNote });
    const res = await api.get(`/faults/${fault.id}/details`);
    setNotes(res.data.notes || []);
    setNewNote("");
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    await api.put(`/faults/${fault.id}`, { status: newStatus });
    const res = await api.get(`/faults/${fault.id}/details`);
    setDetails(res.data.fault);
  };

  if (!fault || !details) return null;

  return (
    <div style={overlayStyle}>
      <div style={drawerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>
            Ticket #{details.ticket_number || details.id}
          </h3>
          <button onClick={onClose} style={closeButtonStyle}>
            ✖
          </button>
        </div>

        {/* Tabs */}
        <div style={tabBarStyle}>
          {["Details", "Notes", "History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeTab === tab ? "#007bff" : "#f0f0f0",
                color: activeTab === tab ? "white" : "black",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <hr
          style={{
            marginTop: "10px",
            marginBottom: "15px",
            borderColor: "#ddd",
          }}
        />

        {/* Tab Content */}
        <div>
          {activeTab === "Details" && (
            <div style={gridStyle}>
              <>
                <div>
                  <strong>Company:</strong>
                </div>
                <div>{details.customer?.company}</div>

                <div>
                  <strong>Circuit ID:</strong>
                </div>
                <div>{details.customer?.circuit_id}</div>

                <div>
                  <strong>Location:</strong>
                </div>
                <div>{details.customer?.location}</div>

                <div>
                  <strong>IP Address:</strong>
                </div>
                <div>{details.customer?.ip_address}</div>

                <div>
                  <strong>POP Site:</strong>
                </div>
                <div>{details.customer?.pop_site}</div>

                <div>
                  <strong>Switch Info:</strong>
                </div>
                <div>{details.customer?.switch_info}</div>

                <div>
                  <strong>Email:</strong>
                </div>
                <div>{details.customer?.email}</div>
              </>

              <div>
                <strong>Department:</strong>
              </div>
              <div>{details.department?.name || "N/A"}</div>

              <div>
                <strong>Description:</strong>
              </div>
              <div>{details.description}</div>

              <div>
                <strong>Location:</strong>
              </div>
              <div>{details.location}</div>

              <div>
                <strong>Owner:</strong>
              </div>
              <div>{details.owner}</div>

              <div>
                <strong>Type:</strong>
              </div>
              <div>{details.type}</div>

              <div>
                <strong>Status:</strong>
              </div>
              <div>
                <select
                  value={details.status}
                  onChange={handleStatusChange}
                  style={{ padding: "4px", borderRadius: "4px" }}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>

              <div>
                <strong>Severity:</strong>
              </div>
              <div>
                <span style={badgeStyle(details.severity)}>
                  {details.severity || "N/A"}
                </span>
              </div>

              <div>
                <strong>Pending:</strong>
              </div>
              <div>
                {typeof details.pending_hours === "number"
                  ? `${details.pending_hours.toFixed(1)} hrs`
                  : details.pending_hours}
              </div>

              <div>
                <strong>Logged:</strong>
              </div>
              <div>{new Date(details.createdAt).toLocaleString()}</div>

              {details.resolvedAt && (
                <>
                  <div>
                    <strong>Resolved At:</strong>
                  </div>
                  <div>
                    {new Date(details.resolvedAt).toLocaleString()}{" "}
                    {details.resolvedBy?.username && (
                      <span style={{ fontSize: "0.85em", color: "#555" }}>
                        by {details.resolvedBy.username}
                      </span>
                    )}
                  </div>
                </>
              )}

              {details.closedAt && (
                <>
                  <div>
                    <strong>Closed At:</strong>
                  </div>
                  <div>
                    {new Date(details.closedAt).toLocaleString()}{" "}
                    {details.closedBy?.username && (
                      <span style={{ fontSize: "0.85em", color: "#555" }}>
                        by {details.closedBy.username}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "Notes" && (
            <div>
              {notes.length === 0 ? (
                <p>No notes yet.</p>
              ) : (
                <div
                  style={{
                    maxHeight: "250px",
                    overflowY: "auto",
                    marginBottom: "10px",
                  }}
                >
                  {notes.map((note) => (
                    <div key={note.id} style={noteCardStyle}>
                      <div style={{ fontWeight: "bold" }}>
                        {note.department?.name || "Unknown Department"}
                      </div>
                      <div>{note.content}</div>
                      <div style={{ fontSize: "0.8em", color: "#666" }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                style={noteInputStyle}
              />
              <button onClick={handleAddNote} style={noteButtonStyle}>
                Add Note
              </button>
            </div>
          )}

          {activeTab === "History" && (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <h4 style={{ marginBottom: "8px" }}>
                Previous Faults (Same Customer)
              </h4>
              {history.length <= 1 ? (
                <p>No previous faults.</p>
              ) : (
                history
                  .filter((f) => f.id !== fault.id)
                  .map((f) => (
                    <div
                      key={f.id}
                      style={{ ...historyCardStyle, cursor: "pointer" }}
                      onClick={() => {
                        if (!f?.id) return;

                        setDetails(null);
                        setNotes([]);
                        setActiveTab("Details");

                        // Smoothly reset the drawer before loading new fault
                        setTimeout(() => {
                          api.get(`/faults/${f.id}/details`).then((res) => {
                            setDetails(res.data.fault);
                            setNotes(res.data.notes || []);
                          });
                          api.get(`/faults/${f.id}/history`).then((res) => {
                            setStatusHistory(res.data || []);
                          });

                          // Only fetch customer history if customer info is available
                          if (f.customer?.id) {
                            api
                              .get(`/customers/${f.customer.id}/history`)
                              .then((res) => {
                                setHistory(res.data || []);
                              });
                          }
                        }, 100);
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>
                        #{f.ticket_number || f.id} – {f.description}
                      </div>
                      <div>
                        <span style={statusBadgeStyle(f.status)}>
                          {f.status}
                        </span>{" "}
                        | {new Date(f.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
              )}

              <hr style={{ margin: "15px 0" }} />

              <h4 style={{ marginBottom: "8px" }}>Status Change History</h4>
              {statusHistory.length === 0 ? (
                <p>No status changes recorded.</p>
              ) : (
                statusHistory.map((entry) => (
                  <div key={entry.id} style={noteCardStyle}>
                    <div>
                      <strong>
                        {entry.previous_status} ➜ {entry.new_status}
                      </strong>{" "}
                      <span style={{ fontSize: "0.8em", color: "#555" }}>
                        ({new Date(entry.createdAt).toLocaleString()})
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85em", color: "#444" }}>
                      by {entry.user?.username || "Unknown User"}
                    </div>
                    {entry.note && (
                      <div style={{ marginTop: "5px", fontStyle: "italic" }}>
                        Note: {entry.note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 1000,
};

const drawerStyle = {
  width: "420px",
  background: "#fff",
  height: "100%",
  padding: "20px",
  overflowY: "auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const closeButtonStyle = {
  fontSize: "20px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const tabBarStyle = {
  display: "flex",
  gap: "10px",
};

const tabButtonStyle = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  rowGap: "10px",
  columnGap: "10px",
};

const badgeStyle = (severity) => {
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

const noteCardStyle = {
  background: "#f9f9f9",
  border: "1px solid #ddd",
  borderRadius: "5px",
  padding: "10px",
  marginBottom: "10px",
};

const noteInputStyle = {
  width: "100%",
  minHeight: "60px",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  resize: "vertical",
};

const noteButtonStyle = {
  marginTop: "5px",
  padding: "8px 12px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const historyCardStyle = {
  background: "#f1f1f1",
  border: "1px solid #ccc",
  borderRadius: "5px",
  padding: "10px",
  marginBottom: "10px",
};

const statusBadgeStyle = (status) => {
  const colors = {
    Open: "#17a2b8",
    "In Progress": "#ffc107",
    Resolved: "#28a745",
    Closed: "#6c757d",
  };
  return {
    display: "inline-block",
    backgroundColor: colors[status] || "#999",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.75em",
  };
};
