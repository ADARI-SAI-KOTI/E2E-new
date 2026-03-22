import { useState } from "react";
import { api } from "../../../services/api";
import { VALIDATION_MESSAGES } from "../../../utils/constants";

export default function CitizenLogin({ onLogin, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    if (!password) {
      newErrors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Call backend API login
      const res = await api.citizenLogin(email, password);

      if (res.code === 200) {
        setMessage({
          type: "success",
          text: "Login successful! Redirecting..."
        });

        setTimeout(() => {
          onLogin(res.user);
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || `Login failed. (${res.code || "?"})`,
        });
        console.error("Login failed:", res);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: error?.message || "An error occurred. Please try again."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Citizen Login</h2>

        {message && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
            />
            {errors.password && <span className="error">{errors.password}</span>}
            <div className="password-toggle">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <label htmlFor="showPassword">Show password</label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? 
          <button 
            className="link-button" 
            onClick={onRegisterClick}
            disabled={isLoading}
          >
            Register here
          </button>
        </p>

        <div className="auth-demo">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: rajesh@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}
