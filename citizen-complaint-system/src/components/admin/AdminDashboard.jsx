import { useState, useEffect } from "react";
import { api } from "../../services/api";
import ComplaintCard from "../common/ComplaintCard";

/**
 * ADMIN DASHBOARD
 * Admin overview showing all complaints from all departments
 */
export default function AdminDashboard({ navigate }) {
  const [complaintsByStatus, setComplaintsByStatus] = useState({
    pending: [],
    accepted: [],
    inProgress: [],
    resolved: [],
    rejected: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getAllComplaints();
        if (res.success) {
          // Group complaints by status
          const grouped = {
            pending: res.data.filter(c => c.status === 'pending'),
            accepted: res.data.filter(c => c.status === 'accepted'),
            inProgress: res.data.filter(c => c.status === 'in-progress'),
            resolved: res.data.filter(c => c.status === 'resolved'),
            rejected: res.data.filter(c => c.status === 'rejected')
          };
          setComplaintsByStatus(grouped);
        } else {
          setError(res.message || "Failed to load complaints");
        }
      } catch (err) {
        setError("An error occurred while loading complaints");
      }

      setIsLoading(false);
    };

    fetchComplaints();
  }, []);

  const stats = {
    total: Object.values(complaintsByStatus).flat().length,
    pending: complaintsByStatus.pending.length,
    accepted: complaintsByStatus.accepted.length,
    inProgress: complaintsByStatus.inProgress.length,
    resolved: complaintsByStatus.resolved.length,
    rejected: complaintsByStatus.rejected.length
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p className="page-subtitle">Overview of all complaints across departments</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.accepted}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="btn-primary" onClick={() => navigate("validate")}>
          🔍 View All Complaints
        </button>
        <button className="btn-primary" onClick={() => navigate("restricted")}>
          🚫 Manage Restricted Users
        </button>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="loading">Loading complaints...</div>
      )}

      {error && (
        <div className="message message-error">{error}</div>
      )}

      {!isLoading && !error && stats.total === 0 && (
        <div className="empty-state">
          <h3>No Complaints Found</h3>
          <p>No complaints have been submitted yet.</p>
        </div>
      )}

      {!isLoading && !error && stats.total > 0 && (
        <div className="complaints-sections">
          {stats.pending > 0 && (
            <div className="section">
              <h3>🟡 Pending Review ({stats.pending})</h3>
              <div className="complaints-list">
                {complaintsByStatus.pending.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("validate")}
                  />
                ))}
              </div>
            </div>
          )}

          {stats.accepted > 0 && (
            <div className="section">
              <h3>🟢 Accepted ({stats.accepted})</h3>
              <div className="complaints-list">
                {complaintsByStatus.accepted.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("validate")}
                  />
                ))}
              </div>
            </div>
          )}

          {stats.inProgress > 0 && (
            <div className="section">
              <h3>🔄 In Progress ({stats.inProgress})</h3>
              <div className="complaints-list">
                {complaintsByStatus.inProgress.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("validate")}
                  />
                ))}
              </div>
            </div>
          )}

          {stats.resolved > 0 && (
            <div className="section">
              <h3>✅ Resolved ({stats.resolved})</h3>
              <div className="complaints-list">
                {complaintsByStatus.resolved.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("validate")}
                  />
                ))}
              </div>
            </div>
          )}

          {stats.rejected > 0 && (
            <div className="section">
              <h3>❌ Rejected ({stats.rejected})</h3>
              <div className="complaints-list">
                {complaintsByStatus.rejected.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("validate")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
