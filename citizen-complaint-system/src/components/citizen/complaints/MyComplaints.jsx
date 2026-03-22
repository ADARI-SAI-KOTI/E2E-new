import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import ComplaintCard from "../../common/ComplaintCard";
import BackButton from "../../common/BackButton";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from "../../../utils/constants";

/**
 * MY COMPLAINTS
 * Lists all complaints submitted by the logged-in citizen
 * Includes filtering by status and category
 * Provides back navigation to dashboard
 */
export default function MyComplaints({ citizenId, onBack, canGoBack }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "ALL",
    category: "ALL"
  });

  // Fetch complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getMyComplaints(citizenId);
        if (res.code === 200) {
          setComplaints(res.data);
        } else {
          setError("Failed to load complaints");
        }
      } catch (err) {
        setError("An error occurred while loading complaints");
      }

      setIsLoading(false);
    };

    if (citizenId) {
      fetchComplaints();
    }
  }, [citizenId]);

  // Apply filters
  const filteredComplaints = complaints.filter(complaint => {
    const statusMatch = filters.status === "ALL" || complaint.status === filters.status;
    const categoryMatch = filters.category === "ALL" || complaint.category === filters.category;
    return statusMatch && categoryMatch;
  });

  // Calculate statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => 
      c.status === "Submitted" || 
      c.status === "Pending Validation" ||
      c.status === "Accepted" ||
      c.status === "Assigned" ||
      c.status === "In Progress"
    ).length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    rejected: complaints.filter(c => c.status === "Rejected").length
  };

  return (
    <div className="complaints-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />
      <div className="page-header">
        <h2>My Complaints</h2>
        <p className="page-subtitle">Track all complaints you have submitted</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
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

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="ALL">All Status</option>
            {Object.values(COMPLAINT_STATUS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="ALL">All Categories</option>
            {Object.values(COMPLAINT_CATEGORIES).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="loading">Loading your complaints...</div>
      )}

      {error && (
        <div className="message message-error">{error}</div>
      )}

      {!isLoading && !error && filteredComplaints.length === 0 && (
        <div className="empty-state">
          <h3>No Complaints Found</h3>
          <p>{complaints.length === 0 
            ? "You haven't submitted any complaints yet." 
            : "No complaints match your filters."}</p>
        </div>
      )}

      {!isLoading && !error && filteredComplaints.length > 0 && (
        <div className="complaints-list">
          {filteredComplaints.map(complaint => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onSelect={(c) => {
                // Handle view details - will navigate in App.jsx
                console.log("View complaint:", c);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
