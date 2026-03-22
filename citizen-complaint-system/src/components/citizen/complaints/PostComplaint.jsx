import { useState } from "react";
import { api } from "../../../services/api";
import { getCurrentLocation, formatLocation, getAddressFromCoordinates } from "../../../services/locationService";
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS, VALIDATION_MESSAGES } from "../../../utils/constants";
import BackButton from "../../common/BackButton";

/**
 * POST COMPLAINT
 * Citizen complaint submission form with location, image, and category selection
 * Includes duplicate complaint detection
 * Provides back navigation to dashboard
 */
export default function PostComplaint({ citizenId, onSubmitSuccess, onBack, canGoBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    category: COMPLAINT_CATEGORIES.ROAD,
    title: "",
    description: "",
    priority: PRIORITY_LEVELS.MEDIUM,
    imageUrl: null,
    imageFile: null
  });

  const [location, setLocation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // ========================
  // Validation
  // ========================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.description.trim()) {
      newErrors.description = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (formData.description.trim().length < 20) {
      newErrors.description = VALIDATION_MESSAGES.DESCRIPTION_TOO_SHORT;
    }

    if (!location) {
      newErrors.location = "Location is required. Please use 'Get My Location'.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================
  // Handlers
  // ========================

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: VALIDATION_MESSAGES.FILE_TOO_LARGE
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: VALIDATION_MESSAGES.INVALID_FILE_TYPE
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData({ ...formData, imageUrl: reader.result, imageFile: file });
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setMessage(null);

    try {
      const coords = await getCurrentLocation();
      const address = await getAddressFromCoordinates(coords.lat, coords.lng);
      setLocation(address);
      setMessage({
        type: "success",
        text: `Location captured: ${formatLocation(address)}`
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    }

    setIsGettingLocation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    const complaintData = {
      ...formData,
      location: formatLocation(location),
      latitude: location.lat,
      longitude: location.lng
    };

    try {
      const res = await api.postComplaint(complaintData);

      if (res.isDuplicate) {
        setMessage({
          type: "warning",
          text: `Similar complaint already exists (ID: ${res.existingId}). Do you want to continue?`
        });
      } else if (res.code === 201) {
        setMessage({
          type: "success",
          text: `Complaint submitted successfully! ID: ${res.complaintId}`
        });
        // Reset form
        setTimeout(() => {
          setFormData({
            category: COMPLAINT_CATEGORIES.ROAD,
            title: "",
            description: "",
            priority: PRIORITY_LEVELS.MEDIUM,
            imageUrl: null,
            imageFile: null
          });
          setLocation(null);
          setImagePreview(null);
          setMessage(null);
          if (onSubmitSuccess) {
            onSubmitSuccess(res.complaint);
          }
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: `(${res.code || "?"}) ${res.message || "Failed to submit complaint. Please try again."}`
        });
        console.error("Complaint submission failed:", res);
      }
    } catch (error) {
      console.error("Complaint submit error:", error);
      setMessage({
        type: "error",
        text: error?.message || "An error occurred. Please try again."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="form-container">
      <BackButton onBack={onBack} canGoBack={canGoBack} label="Back to Dashboard" />
      <div className="form-card">
        <h2>Post a New Complaint</h2>
        <p className="form-subtitle">Help us improve public services by reporting issues in your area</p>

        {/* Message Display */}
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isLoading}
            >
              {Object.values(COMPLAINT_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for the complaint"
              disabled={isLoading}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              disabled={isLoading}
            >
              {Object.values(PRIORITY_LEVELS).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the complaint (minimum 20 characters)"
              rows="5"
              disabled={isLoading}
            />
            <span className="hint">{formData.description.length} characters</span>
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          {/* Location Section */}
          <div className="form-section">
            <h4>Location</h4>
            {location ? (
              <div className="location-display">
                <div className="location-info">
                  <p><strong>Area:</strong> {location.area}</p>
                  <p><strong>City:</strong> {location.city}</p>
                  <p><strong>Landmark:</strong> {location.landmark}</p>
                  <p><strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleGetLocation}
                  disabled={isLoading || isGettingLocation}
                >
                  Update Location
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleGetLocation}
                disabled={isLoading || isGettingLocation}
              >
                {isGettingLocation ? "Getting location..." : "Get My Location"}
              </button>
            )}
            {errors.location && <span className="error">{errors.location}</span>}
          </div>

          {/* Image Upload Section */}
          <div className="form-section">
            <h4>Evidence (Image)</h4>
            <div className="file-upload">
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isLoading}
              />
              <label htmlFor="imageInput" className="file-label">
                📷 Choose Image or Drag & Drop
              </label>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="btn-small"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, imageUrl: null, imageFile: null });
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
