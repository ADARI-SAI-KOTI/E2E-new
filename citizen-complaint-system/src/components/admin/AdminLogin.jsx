import { useState } from "react";
import { api } from "../../services/api";
import { VALIDATION_MESSAGES } from "../../utils/constants";

/**
 * ADMIN LOGIN
 * Admin authentication screen
 * Demo credentials: admin@example.com / admin123
 */
export default function AdminLogin({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [credentials, setCredentials] = useState({
    email: "admin@example.com",
    password: "admin123"
  });

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    if (!credentials.password) {
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
      const res = await api.adminLogin(credentials.email, credentials.password);

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
          text: res.message || "Login failed. Please check your credentials."
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Login</h2>
        <p className="auth-subtitle">Access the admin dashboard</p>

        {message && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
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

        <div className="auth-demo">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: admin@example.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
