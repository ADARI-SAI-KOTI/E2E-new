import StatusBadge from "./StatusBadge";

/**
 * COMPLAINT CARD
 * Reusable card component for displaying complaint summary
 * Used across all dashboards and list views
 */
export default function ComplaintCard({ complaint, onSelect, onAction }) {
  if (!complaint) return null;

  const complaintId = complaint.id || complaint._id;
  const complaintImage = complaint.imageUrl || complaint.attachments?.[0] || null;

  const formatLocationText = () => {
    if (!complaint.location) return "";
    if (typeof complaint.location === "string") return complaint.location;
    const parts = [];
    if (complaint.location.area) parts.push(complaint.location.area);
    if (complaint.location.city) parts.push(complaint.location.city);
    return parts.join(', ');
  };

  const handleClick = () => {
    if (onSelect) onSelect(complaint);
  };

  return (
    <div className="complaint-card" onClick={handleClick}>
      <div className="card-header">
        <div className="card-id-section">
          <h4 className="complaint-id">{complaintId}</h4>
          <p className="complaint-title">{complaint.title}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="card-body">
        <div className="card-row">
          <div className="card-col">
            <label>Category</label>
            <p>{complaint.category}</p>
          </div>
          <div className="card-col">
            <label>Priority</label>
            <p className={`priority-${complaint.priority?.toLowerCase()}`}>
              {complaint.priority}
            </p>
          </div>
        </div>

        <div className="card-row">
          <div className="card-col">
            <label>Location</label>
            <p>{formatLocationText()}</p>
          </div>
          {complaint.assignedDepartment && (
            <div className="card-col">
              <label>Department</label>
              <p>{complaint.assignedDepartment}</p>
            </div>
          )}
        </div>

        <div className="card-row">
          <div className="card-col">
            <label>Submitted</label>
            <p>{new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
          {complaint.updatedAt && (
            <div className="card-col">
              <label>Updated</label>
              <p>{new Date(complaint.updatedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {complaint.resolution && (
          <div className="card-row">
            <div className="card-col full-width">
              <label>Resolution</label>
              <p>{complaint.resolution}</p>
            </div>
          </div>
        )}
      </div>

      {complaintImage && (
        <div className="card-image">
          <img src={complaintImage} alt="Complaint Evidence" />
        </div>
      )}

      {onAction && (
        <div className="card-actions">
          {onAction.actions?.map((action, idx) => (
            <button
              key={idx}
              className={`btn-action btn-${action.type}`}
              onClick={(e) => {
                e.stopPropagation();
                action.handler(complaint);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
