import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import BackButton from "../../common/BackButton";
import { VALIDATION_MESSAGES } from "../../../utils/constants";

/**
 * CITIZEN PROFILE
 * Displays citizen profile information and allows updates
 * Provides back navigation to dashboard
 */
export default function CitizenProfile({ citizenId, onLogout, onBack, canGoBack }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: ""
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.getCitizenProfile(citizenId);

        if (res.code === 200) {
          setProfile(res.data);
          setEditData({
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            address: res.data.address,
            city: res.data.city
          });
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        setError("An error occurred while loading your profile");
      }

      setIsLoading(false);
    };

    if (citizenId) {
      fetchProfile();
    }
  }, [citizenId]);

  // Validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.name.trim()) {
      newErrors.name = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    if (!editData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (!validateEmail(editData.email)) {
      newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }

    if (!editData.phone.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (!validatePhone(editData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!editData.address.trim()) {
      newErrors.address = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    if (!editData.city.trim()) {
      newErrors.city = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await api.updateCitizenProfile(editData);

      if (res.code === 200) {
        if (res.user) {
          setProfile(res.user);
          setEditData({
            name: res.user.name || "",
            email: res.user.email || "",
            phone: res.user.phone || "",
            address: res.user.address || "",
            city: res.user.city || ""
          });
        }
        setIsEditing(false);
        setMessage({
          type: "success",
          text: "Profile updated successfully"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Failed to update profile"
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred while updating your profile"
      });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (error && !profile) {
    return <div className="message message-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />
      <div className="page-header">
        <h2>My Profile</h2>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      {/* Profile View Mode */}
      {!isEditing && profile && (
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-title">
              <h3>{profile.name}</h3>
              <p>{profile.email}</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>

          <div className="profile-sections">
            {/* Personal Information */}
            <div className="profile-section">
              <h4>Personal Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profile.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profile.email}</p>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <p>{profile.phone}</p>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <p>{profile.address}</p>
                </div>
                <div className="info-item">
                  <label>City</label>
                  <p>{profile.city}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="profile-section">
              <h4>Activity Summary</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{profile.complaintStats?.total ?? 0}</div>
                  <div className="stat-label">Total Complaints</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{profile.complaintStats?.resolved ?? 0}</div>
                  <div className="stat-label">Resolved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {(profile.complaintStats?.total ?? 0) - (profile.complaintStats?.resolved ?? 0)}
                  </div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="profile-section">
              <h4>Account Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID</label>
                  <p>{profile.id}</p>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="profile-actions">
            <button
              className="btn-danger"
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  onLogout();
                }
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Mode */}
      {isEditing && profile && (
        <div className="edit-card">
          <h3>Edit Profile</h3>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                disabled={isSaving}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                disabled={isSaving}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                disabled={isSaving}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                disabled={isSaving}
                rows="3"
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                disabled={isSaving}
              />
              {errors.city && <span className="error">{errors.city}</span>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
