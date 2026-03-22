import { useState } from "react";
import { api } from "../../services/api";

export default function DepartmentLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await api.departmentLogin(email, password);

      if (res.code === 200) {
        onLogin(res.user);
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch {
      setMessage({ type: "error", text: "Login failed" });
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Department Login</h2>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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

          <button className="btn-primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}