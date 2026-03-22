import { useState } from "react";
import { api } from "../../../services/api";
import { VALIDATION_MESSAGES } from "../../../utils/constants";

/**
 * CITIZEN REGISTER
 * Multi-step registration with OTP verification
 * Step 1: Personal Details
 * Step 2: OTP Verification
 * Step 3: Address & Credentials
 */
export default function CitizenRegister({ onRegisterSuccess }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Step 1: Personal Details
  const [personalData, setPersonalData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Step 2: OTP
  const [otp, setOtp] = useState("");

  // Step 3: Address & Credentials
  const [credentialData, setCredentialData] = useState({
    address: "",
    city: "",
    password: "",
    confirmPassword: ""
  });

  // ========================
  // Validation
  // ========================

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!personalData.name.trim()) {
      newErrors.name = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }
    if (!personalData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (!validateEmail(personalData.email)) {
      newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }
    if (!personalData.phone.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (!validatePhone(personalData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!credentialData.address.trim()) {
      newErrors.address = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }
    if (!credentialData.city.trim()) {
      newErrors.city = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }
    if (!credentialData.password) {
      newErrors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (credentialData.password.length < 6) {
      newErrors.password = VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
    }
    if (credentialData.password !== credentialData.confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================
  // Handlers
  // ========================

  const handleSendOtp = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setMessage(null);

    // Simulate OTP sending
    setTimeout(() => {
      const mockOtp = "1234";
      setGeneratedOtp(mockOtp);
      setMessage({
        type: "success",
        text: `OTP sent to ${personalData.email} (Demo: ${mockOtp})`
      });
      setOtp("");
      setStep(2);
      setIsLoading(false);
    }, 800);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ otp: VALIDATION_MESSAGES.REQUIRED_FIELD });
      return;
    }

    if (otp !== generatedOtp) {
      setMessage({
        type: "error",
        text: VALIDATION_MESSAGES.INVALID_OTP
      });
      return;
    }

    setMessage({
      type: "success",
      text: "OTP verified! Continue to set password."
    });
    setTimeout(() => {
      setStep(3);
      setMessage(null);
    }, 1500);
  };

  const handleCompleteRegistration = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    setMessage(null);

    const registrationData = {
      ...personalData,
      ...credentialData
    };

    try {
      const res = await api.citizenRegister(registrationData);

      if (res.code === 201) {
        setMessage({
          type: "success",
          text: "Registration successful! Redirecting to login..."
        });
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(res.user);
          }
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Registration failed. Please try again."
      });
    }

    setIsLoading(false);
  };

  const goBack = () => {
    if (step > 1) {
      setMessage(null);
      setErrors({});
      setStep(step - 1);
    }
  };

  // ========================
  // Render Steps
  // ========================

  return (
    <div className="auth-container">
      <div className="auth-card registration-card">
        <h2>Create Citizen Account</h2>
        <p className="step-indicator">Step {step} of 3</p>

        {/* Message Display */}
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={personalData.name}
                onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={personalData.email}
                onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number (10 digits) *</label>
              <input
                type="tel"
                value={personalData.phone}
                onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                placeholder="9876543210"
                disabled={isLoading}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
            <div className="form-info">
              <p>Enter the 4-digit OTP sent to your email: <strong>{personalData.email}</strong></p>
            </div>

            <div className="form-group">
              <label>Enter OTP *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength="4"
                disabled={isLoading}
              />
              {errors.otp && <span className="error">{errors.otp}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={goBack} disabled={isLoading}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Address & Credentials */}
        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); handleCompleteRegistration(); }}>
            <div className="form-group">
              <label>Address *</label>
              <textarea
                value={credentialData.address}
                onChange={(e) => setCredentialData({ ...credentialData, address: e.target.value })}
                placeholder="Enter your residential address"
                disabled={isLoading}
                rows="3"
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={credentialData.city}
                onChange={(e) => setCredentialData({ ...credentialData, city: e.target.value })}
                placeholder="Enter your city"
                disabled={isLoading}
              />
              {errors.city && <span className="error">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={credentialData.password}
                onChange={(e) => setCredentialData({ ...credentialData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                disabled={isLoading}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={credentialData.confirmPassword}
                onChange={(e) => setCredentialData({ ...credentialData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={goBack} disabled={isLoading}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
