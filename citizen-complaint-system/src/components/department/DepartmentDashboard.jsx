import { useState, useEffect } from "react";
import { api } from "../../services/api";
import ComplaintCard from "../common/ComplaintCard";

/**
 * DEPARTMENT DASHBOARD
 * Shows workload organized by status: Pending (needs accept/reject), Accepted, In Progress, Resolved
 */
export default function DepartmentDashboard({ navigate, departmentName }) {
  const [complaintsByStatus, setComplaintsByStatus] = useState({
    pending: [],
    accepted: [],
    inProgress: [],
    resolved: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getAssignedComplaints();

        if (res.success) {
          // Group complaints by status
          const grouped = {
            pending: res.data.filter(c => c.status === 'pending'),
            accepted: res.data.filter(c => c.status === 'accepted'),
            inProgress: res.data.filter(c => c.status === 'in-progress'),
            resolved: res.data.filter(c => c.status === 'resolved')
          };
          setComplaintsByStatus(grouped);
        } else {
          setError(res.message || "Failed to load complaints");
        }
      } catch (err) {
        setError("An error occurred");
      }

      setIsLoading(false);
    };

    fetchComplaints();
  }, []);

  const stats = {
    pending: complaintsByStatus.pending.length,
    accepted: complaintsByStatus.accepted.length,
    inProgress: complaintsByStatus.inProgress.length,
    resolved: complaintsByStatus.resolved.length,
    total: Object.values(complaintsByStatus).flat().length
  };

  return (
    <div className="department-container">
      <div className="page-header">
        <h2>{departmentName} - Dashboard</h2>
        <p className="page-subtitle">Manage assigned complaints and track progress</p>
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
      </div>

      {isLoading && <div className="loading">Loading complaints...</div>}

      {error && <div className="message message-error">{error}</div>}

      {!isLoading && !error && (
        <>
          {/* Pending Section */}
          <section className="status-section">
            <h3>🟡 Pending Review ({stats.pending})</h3>
            {complaintsByStatus.pending.length === 0 ? (
              <div className="empty-state">
                <p>No pending complaints to review</p>
              </div>
            ) : (
              <div className="complaints-list">
                {complaintsByStatus.pending.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("details", complaint._id || complaint.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Accepted Section */}
          <section className="status-section">
            <h3>🟢 Accepted ({stats.accepted})</h3>
            {complaintsByStatus.accepted.length === 0 ? (
              <div className="empty-state">
                <p>No accepted complaints</p>
              </div>
            ) : (
              <div className="complaints-list">
                {complaintsByStatus.accepted.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("details", complaint._id || complaint.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* In Progress Section */}
          <section className="status-section">
            <h3>🔄 In Progress ({stats.inProgress})</h3>
            {complaintsByStatus.inProgress.length === 0 ? (
              <div className="empty-state">
                <p>No complaints in progress</p>
              </div>
            ) : (
              <div className="complaints-list">
                {complaintsByStatus.inProgress.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("details", complaint._id || complaint.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Resolved Section */}
          <section className="status-section">
            <h3>✅ Resolved ({stats.resolved})</h3>
            {complaintsByStatus.resolved.length === 0 ? (
              <div className="empty-state">
                <p>No resolved complaints</p>
              </div>
            ) : (
              <div className="complaints-list">
                {complaintsByStatus.resolved.map(complaint => (
                  <ComplaintCard
                    key={complaint._id || complaint.id}
                    complaint={complaint}
                    onSelect={() => navigate("details", complaint._id || complaint.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
