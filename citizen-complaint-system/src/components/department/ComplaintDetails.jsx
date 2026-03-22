import { useState, useEffect } from "react";
import { api } from "../../services/api";
import BackButton from "../common/BackButton";
import ComplaintCard from "../common/ComplaintCard";
import { COMPLAINT_STATUS } from "../../utils/constants";

/**
 * COMPLAINT DETAILS
 * Department updates complaint status and resolution
 * Provides back navigation to department dashboard
 */
export default function ComplaintDetails({ complaintId, onBack, canGoBack }) {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [updateData, setUpdateData] = useState({
    status: "",
    resolution: ""
  });

  useEffect(() => {
    const fetchComplaint = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getComplaintForDepartment(complaintId);

        if (res.success) {
          setComplaint(res.data);
          setUpdateData({
            status: res.data.status,
            resolution: res.data.resolution || ""
          });
        } else {
          setError("Complaint not found");
        }
      } catch (err) {
        setError("An error occurred");
      }

      setIsLoading(false);
    };

    if (complaintId) {
      fetchComplaint();
    }
  }, [complaintId]);

  const handleAcceptReject = async (action) => {
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await api.updateComplaintStatus(complaintId, { status: action });

      if (res.success) {
        setComplaint(res.data);
        setMessage({
          type: "success",
          text: `Complaint ${action} successfully`
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: res.message || `Failed to ${action} complaint`
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred"
      });
    }

    setIsUpdating(false);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!updateData.status) {
      setMessage({
        type: "error",
        text: "Please select a status"
      });
      return;
    }

    // Require resolution when completing
    if (updateData.status === COMPLAINT_STATUS.RESOLVED && !updateData.resolution.trim()) {
      setMessage({
        type: "error",
        text: "Please provide resolution details"
      });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await api.updateComplaintStatus(complaintId, updateData);

      if (res.success) {
        setComplaint(res.data);
        setMessage({
          type: "success",
          text: "Complaint status updated successfully"
        });
        setIsEditing(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update complaint"
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred"
      });
    }

    setIsUpdating(false);
  };

  if (isLoading) {
    return <div className="loading">Loading complaint details...</div>;
  }

  if (error || !complaint) {
    return (
      <div>
        <div className="message message-error">{error || "Complaint not found"}</div>
        <button className="btn-secondary" onClick={onBack}>← Back to Dashboard</button>
      </div>
    );
  }

  const departmentStatusOptions = [
    COMPLAINT_STATUS.ACCEPTED,
    COMPLAINT_STATUS.IN_PROGRESS,
    COMPLAINT_STATUS.RESOLVED
  ];

  return (
    <div className="complaint-details-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />

      <div className="page-header">
        <h2>Complaint Details</h2>
        <p className="page-subtitle">Update complaint status and resolution</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      {/* Complaint Information */}
      <ComplaintCard complaint={complaint} />

      {/* Update Section */}
      <div className="section">
        <h3>Actions</h3>

        {complaint.status === 'pending' ? (
          <div className="action-buttons">
            <button
              className="btn-success"
              onClick={() => handleAcceptReject('accepted')}
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : "✅ Accept Complaint"}
            </button>
            <button
              className="btn-danger"
              onClick={() => handleAcceptReject('rejected')}
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : "❌ Reject Complaint"}
            </button>
          </div>
        ) : (
          <>
            {!isEditing ? (
              <div className="status-display">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Current Status</label>
                    <p>{complaint.status}</p>
                  </div>
                  <div className="info-item">
                    <label>Resolution</label>
                    <p>{complaint.resolution || "Not yet resolved"}</p>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Status
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateStatus}>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    disabled={isUpdating}
                  >
                    <option value="">Select Status</option>
                    {departmentStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {updateData.status === COMPLAINT_STATUS.RESOLVED && (
                  <div className="form-group">
                    <label>Resolution Details *</label>
                    <textarea
                      value={updateData.resolution}
                      onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                      placeholder="Describe how the complaint was resolved"
                      rows="4"
                      disabled={isUpdating}
                    />
                  </div>
                )}

                {updateData.status === COMPLAINT_STATUS.IN_PROGRESS && (
                  <div className="form-group">
                    <label>Progress Note (Optional)</label>
                    <textarea
                      value={updateData.resolution}
                      onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                      placeholder="Add any progress notes or updates"
                      rows="3"
                      disabled={isUpdating}
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setUpdateData({
                        status: complaint.status,
                        resolution: complaint.resolution || ""
                      });
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      <div className="section">
        <h3>Complaint Timeline</h3>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h5>Submitted</h5>
              <p>{new Date(complaint.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {complaint.status !== COMPLAINT_STATUS.SUBMITTED && (
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h5>{complaint.status}</h5>
                <p>{new Date(complaint.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
