import "./FaultDetailsDrawer.css";

export default function FaultDetailsDrawer({ fault, onClose }) {
  if (!fault) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <h3>Fault Details</h3>

        {/* Fault Information */}
        <div className="drawer-section">
          <h4>Fault Information</h4>
          {renderRow("Ticket Number", fault.ticket_number || fault.id)}
          {renderRow("Description", fault.description)}
          {renderRow("Type", fault.type)}
          {renderRow("Location", fault.location)}
          {renderRow("Owner", fault.owner)}
          {renderRow("Status", fault.status)}
          {renderRow("Severity", fault.severity)}
          {renderRow("Pending Time", formatPending(fault.pending_hours))}
        </div>

        {/* Customer Information */}
        <div className="drawer-section">
          <h4>Customer Details</h4>
          {renderRow("Company", fault.Customer?.company)}
          {renderRow("Circuit ID", fault.Customer?.circuit_id)}
          {renderRow("Type", fault.Customer?.type)}
          {renderRow("Location", fault.Customer?.location)}
          {renderRow("Owner", fault.Customer?.owner)}
          {renderRow("IP Address", fault.Customer?.ip_address)}
          {renderRow("POP Site", fault.Customer?.pop_site)}
          {renderRow("Email", fault.Customer?.email)}
          {renderRow("Switch Info", fault.Customer?.switch_info)}
        </div>

        {/* Department Info */}
        <div className="drawer-section">
          <h4>Assigned Department</h4>
          {renderRow("Department", fault.Department?.name)}
        </div>

        {/* Notes & History */}
        <div className="drawer-section">
          <h4>Notes & History</h4>
          <button
            className="view-notes-btn"
            onClick={() => alert("Notes section coming soon!")}
          >
            View Notes
          </button>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function renderRow(label, value) {
  return (
    <p>
      <strong>{label}:</strong> {value || "N/A"}
    </p>
  );
}

function formatPending(pendingHours) {
  if (pendingHours == null) return "N/A";
  if (pendingHours >= 24) {
    const days = (pendingHours / 24).toFixed(1);
    return `${days} days`;
  }
  return `${pendingHours.toFixed(1)} hrs`;
}
