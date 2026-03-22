/**
 * NAVBAR
 * Global navigation bar shown on all pages
 * Displays user role and logout button
 */
export default function Navbar({ role, onLogout, currentPage }) {
  const getRoleLabel = (role) => {
    const roleMap = {
      "CITIZEN": "Citizen Portal",
      "ADMIN": "Admin Portal",
      "DEPARTMENT": "Department Portal"
    };
    return roleMap[role] || "Complaint Management System";
  };

  // Hide logout on login/register pages
  const isAuthPage = currentPage === "login" || currentPage === "register";
  const showLogout = role && !isAuthPage;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>🏛️ Citizen Complaint Management System</h1>
          {role && <p className="role-badge">{getRoleLabel(role)}</p>}
        </div>

        {showLogout && (
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
