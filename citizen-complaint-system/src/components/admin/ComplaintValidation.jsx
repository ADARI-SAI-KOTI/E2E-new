import { useState, useEffect } from "react";
import { api } from "../../services/api";
import BackButton from "../common/BackButton";
import ComplaintCard from "../common/ComplaintCard";

/**
 * COMPLAINT VALIDATION
 * Admin validates and accepts/rejects complaints
 * Provides back navigation to admin dashboard
 */
export default function ComplaintValidation({ onBack, canGoBack }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getPendingComplaints();
        if (res.code === 200) {
          setComplaints(res.data);
        } else {
          setError("Failed to load complaints");
        }
      } catch (err) {
        setError("An error occurred");
      }

      setIsLoading(false);
    };

    fetchComplaints();
  }, []);


  if (isLoading) {
    return <div className="loading">Loading complaints...</div>;
  }

  if (error) {
    return <div className="message message-error">{error}</div>;
  }

  if (complaints.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Complaints to Validate</h3>
        <p>All complaints have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="validation-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />
      <div className="page-header">
        <h2>Complaint Review (Read Only)</h2>
        <p className="page-subtitle">Department users are responsible for accepting or rejecting complaints.</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <div className="info-box">
        <p>
          This view is read-only. To accept or reject complaints, please login as the appropriate department user.
        </p>
      </div>

      <div className="complaints-list">
        {complaints.map((complaint) => (
          <ComplaintCard
            key={complaint._id || complaint.id}
            complaint={complaint}
          />
        ))}
      </div>
    </div>
  );
}
