import { useState } from "react";
import { api } from "../../../services/api";
import ComplaintCard from "../../common/ComplaintCard";
import BackButton from "../../common/BackButton";

/**
 * TRACK COMPLAINT
 * Allows citizens to track a single complaint by ID
 * Shows detailed status, timeline, and resolution info
 * Provides back navigation to dashboard
 */
export default function TrackComplaint({ onBack, canGoBack }) {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmedId = complaintId.trim();

    if (!trimmedId) {
      setError("Please enter a complaint ID");
      return;
    }

    // Complaint IDs are MongoDB ObjectIds (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(trimmedId)) {
      setError(
        "Please enter a valid complaint ID (24 character hexadecimal).")
      return;
    }

    setIsLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const res = await api.trackComplaint(trimmedId);

      if (res.code === 200) {
        setComplaint(res.data);
      } else {
        // Show the server message when available (e.g. unauthorized, forbidden, not found)
        setError(
          res.message ||
            "Complaint not found. Make sure you are using the ID shown after submitting the complaint, and that you're logged in with the same account."
        );
      }
    } catch (err) {
      setError("An error occurred while searching for the complaint");
    }

    setIsLoading(false);
    setSearched(true);
  };

  // Timeline data
  const getTimeline = () => {
    if (!complaint) return [];

    const timeline = [
      {
        status: "Submitted",
        date: complaint.createdAt,
        description: "Your complaint was received"
      }
    ];

    if (complaint.status !== "Submitted") {
      timeline.push({
        status: "Pending Validation",
        date: complaint.updatedAt,
        description: "Under review by admin"
      });
    }

    if (complaint.status === "Accepted" || complaint.status === "Assigned" || complaint.status === "In Progress" || complaint.status === "Resolved") {
      timeline.push({
        status: "Accepted",
        date: complaint.updatedAt,
        description: `Assigned to ${complaint.department?.name || "Department"}`
      });
    }

    if (complaint.status === "In Progress" || complaint.status === "Resolved") {
      timeline.push({
        status: "In Progress",
        date: complaint.updatedAt,
        description: "Work is in progress"
      });
    }

    if (complaint.status === "Resolved") {
      timeline.push({
        status: "Resolved",
        date: complaint.updatedAt,
        description: "Issue has been resolved"
      });
    }

    if (complaint.status === "Rejected") {
      timeline.push({
        status: "Rejected",
        date: complaint.updatedAt,
        description: complaint.resolution || "Rejected by admin"
      });
    }

    return timeline;
  };

  return (
    <div className="track-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />
      <div className="page-header">
        <h2>Track Complaint</h2>
        <p className="page-subtitle">Enter your complaint ID to check its status</p>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter complaint ID (shown after submission)"
              disabled={isLoading}
              className="search-input"
            />
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="message message-error">{error}</div>
        )}
      </div>

      {/* No Search Yet */}
      {!searched && (
        <div className="empty-state">
          <h3>Search for Your Complaint</h3>
          <p>Enter your complaint ID to view its current status and updates</p>
        </div>
      )}

      {/* Search Result */}
      {searched && complaint && (
        <div className="track-result">
          {/* Complaint Details */}
          <div className="section">
            <h3>Complaint Details</h3>
            <ComplaintCard complaint={complaint} />
          </div>

          {/* Timeline */}
          <div className="section">
            <h3>Status Timeline</h3>
            <div className="timeline">
              {getTimeline().map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h5>{item.status}</h5>
                    <p className="timeline-date">
                      {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                    </p>
                    <p className="timeline-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="section">
            <h3>Additional Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Priority</label>
                <p>{complaint.priority}</p>
              </div>
              <div className="info-item">
                <label>Assigned Department</label>
                <p>{complaint.department?.name || "Pending Assignment"}</p>
              </div>
              <div className="info-item">
                <label>Created Date</label>
                <p>{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <p>{new Date(complaint.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Estimated Resolution */}
          <div className="section">
            <h3>Estimated Resolution</h3>
            <div className="resolution-info">
              <p>Expected: {new Date(complaint.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p className="hint">Complaints are typically resolved within 30 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Searched but not found */}
      {searched && !complaint && !isLoading && (
        <div className="empty-state">
          <h3>Complaint Not Found</h3>
          <p>Please check the complaint ID and try again</p>
        </div>
      )}
    </div>
  );
}
