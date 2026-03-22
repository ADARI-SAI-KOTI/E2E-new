import { useState, useEffect } from "react";
import { api } from "../../services/api";
import BackButton from "../common/BackButton";

/**
 * RESTRICTED USERS
 * Admin manages blocked/restricted users
 * Provides back navigation to admin dashboard
 */
export default function RestrictedUsers({ onBack, canGoBack }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserReason, setNewUserReason] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getRestrictedUsers();
        if (res.success) {
          setUsers(res.data);
        } else {
          setError(res.message || "Failed to load restricted users");
        }
      } catch (err) {
        setError("An error occurred");
      }

      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  const handleRestrict = async (e) => {
    e.preventDefault();

    if (!newUserEmail.trim() || !newUserReason.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in all fields"
      });
      return;
    }

    setIsAdding(true);
    setMessage(null);

    try {
      const res = await api.restrictUser(newUserEmail, newUserReason);

      if (res.success) {
        setMessage({
          type: "success",
          text: "User restricted successfully"
        });
        setNewUserEmail("");
        setNewUserReason("");

        // Refresh list
        const listRes = await api.getRestrictedUsers();
        if (listRes.success) {
          setUsers(listRes.data);
        }
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to restrict user"
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred"
      });
    }

    setIsAdding(false);
  };

  const handleUnrestrict = async (userId) => {
    if (!window.confirm("Are you sure you want to unrestrict this user?")) {
      return;
    }

    setMessage(null);

    try {
      const res = await api.unrestrictUser(userId);

      if (res.success) {
        setMessage({
          type: "success",
          text: "User unrestricted successfully"
        });

        // Refresh list
        const listRes = await api.getRestrictedUsers();
        if (listRes.success) {
          setUsers(listRes.data);
        }
      } else {
        setMessage({
          type: "error",
          text: "Failed to unrestrict user"
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred"
      });
    }
  };

  return (
    <div className="restricted-users-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />
      <div className="page-header">
        <h2>Restricted Users</h2>
        <p className="page-subtitle">Manage blocked/restricted user accounts</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      {/* Restrict New User Form */}
      <div className="card">
        <h3>Restrict New User</h3>
        <form onSubmit={handleRestrict}>
          <div className="form-group">
            <label>User ID/Email</label>
            <input
              type="text"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter user ID or email"
              disabled={isAdding}
            />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea
              value={newUserReason}
              onChange={(e) => setNewUserReason(e.target.value)}
              placeholder="Reason for restricting this user"
              rows="3"
              disabled={isAdding}
            />
          </div>

          <button type="submit" className="btn-danger" disabled={isAdding}>
            {isAdding ? "Processing..." : "Restrict User"}
          </button>
        </form>
      </div>

      {/* Restricted Users List */}
      <div className="card">
        <h3>Restricted Users ({users.length})</h3>

        {isLoading && <div className="loading">Loading...</div>}

        {error && <div className="message message-error">{error}</div>}

        {!isLoading && !error && users.length === 0 && (
          <div className="empty-state">
            <p>No restricted users</p>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.isActive ? 'Active' : 'Restricted'}</td>
                    <td>
                      <button
                        className="btn-small btn-success"
                        onClick={() => handleUnrestrict(user._id)}
                      >
                        Unrestrict
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
