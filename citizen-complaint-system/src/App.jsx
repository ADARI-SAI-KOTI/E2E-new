import { useState, useEffect } from "react";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import { api } from "./services/api";

// Citizen Components
import CitizenLogin from "./components/citizen/auth/CitizenLogin";
import CitizenRegister from "./components/citizen/auth/CitizenRegister";
import CitizenDashboard from "./components/citizen/dashboard/CitizenDashboard";
import PostComplaint from "./components/citizen/complaints/PostComplaint";
import TrackComplaint from "./components/citizen/complaints/TrackComplaint";
import MyComplaints from "./components/citizen/complaints/MyComplaints";
import CitizenProfile from "./components/citizen/profile/CitizenProfile";

// Admin Components
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ComplaintValidation from "./components/admin/ComplaintValidation";
import RestrictedUsers from "./components/admin/RestrictedUsers";

// Department Components
import DepartmentLogin from "./components/department/DepartmentLogin";
import DepartmentDashboard from "./components/department/DepartmentDashboard";
import ComplaintDetails from "./components/department/ComplaintDetails";

import { ROLES } from "./utils/constants";

/**
 * APP.JSX
 * Central controller application
 * Manages role-based rendering and page navigation
 * 
 * State Management:
 * - role: Current user role (CITIZEN, ADMIN, DEPARTMENT, null)
 * - user: Current user object { id, name, email, role }
 * - currentPage: Current page to display
 * - pageData: Additional data for pages (e.g., complaintId for detail page)
 * - navigationHistory: Stack of visited pages (excludes login/register)
 * 
 * TODO: Future - Replace this state-based navigation with React Router
 * for proper browser history and deep linking support.
 */
export default function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [pageData, setPageData] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        if (res.success && res.data) {
          setUser(res.data);
          const userRole = res.data.role.toUpperCase().replace('-', '_');
          setRole(userRole);
          setCurrentPage("dashboard");
        }
      } catch (error) {
        // Not logged in, stay on login
      }
    };
    checkAuth();
  }, []);

  // ========================
  // Navigation Helpers
  // ========================

  /**
   * Navigate to a page and track in history
   * SINGLE SOURCE OF TRUTH for all page transitions
   * @param {string} page - Target page name
   * @param {*} data - Optional data to pass to page
   */
  const goToPage = (page, data = null) => {
    // Only track non-auth pages in history
    if (currentPage && currentPage !== "login" && currentPage !== "register") {
      setNavigationHistory((prev) => [...prev, currentPage]);
    }
    setCurrentPage(page);
    if (data) setPageData(data);
  };

  /**
   * Navigate back to previous page
   * If going back to role-selection, reset authentication state
   */
  const goBack = () => {
    if (navigationHistory.length > 0) {
      const previousPage = navigationHistory[navigationHistory.length - 1];
      const newHistory = navigationHistory.slice(0, -1);
      
      // If going back to role selection, reset authentication
      if (previousPage === "role-selection") {
        setRole(null);
        setUser(null);
        setCurrentPage("role-selection");
        setNavigationHistory([]);
        setPageData(null);
      } else {
        setNavigationHistory(newHistory);
        setCurrentPage(previousPage);
        setPageData(null);
      }
    }
  };

  /**
   * Check if back navigation is available
   */
  const canGoBack = navigationHistory.length > 0;

  /**
   * Select a role and initialize login flow
   * Initializes history with role-selection so back button works on login
   */
  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setCurrentPage("login");
    setPageData(null);
    // Initialize history with "role-selection" so back button appears on login
    setNavigationHistory(["role-selection"]);
  };

  /**
   * Navigate to another role's auth page from within auth flow
   * Maps auth page names (citizen-login, admin-login, dept-login) to roles
   */
  const goToAuthPage = (authPageName) => {
    const roleMap = {
      "citizen-login": ROLES.CITIZEN,
      "admin-login": ROLES.ADMIN,
      "dept-login": ROLES.DEPARTMENT
    };
    const roleForPage = roleMap[authPageName];
    if (roleForPage) {
      selectRole(roleForPage);
    }
  };

  // ========================
  // Logout Handler
  // ========================
  // ========================
  // Login Handlers
  // ========================

  const handleCitizenLogin = (userData) => {
    setRole(ROLES.CITIZEN);
    setUser(userData);
    setCurrentPage("dashboard");
    setNavigationHistory([]); // Reset history on successful login
  };

  const handleAdminLogin = (userData) => {
    setRole(ROLES.ADMIN);
    setUser(userData);
    setCurrentPage("dashboard");
    setNavigationHistory([]); // Reset history on successful login
  };

  const handleDepartmentLogin = (userData) => {
    setRole(ROLES.DEPARTMENT);
    setUser(userData);
    setCurrentPage("dashboard");
    setNavigationHistory([]); // Reset history on successful login
  };

  const handleCitizenRegister = (userData) => {
    setRole(ROLES.CITIZEN);
    setUser(userData);
    setCurrentPage("dashboard");
    setNavigationHistory([]); // Reset history on successful registration
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setRole(null);
    setUser(null);
    setCurrentPage("login");
    setPageData(null);
    setNavigationHistory([]);
  };

  // ========================
  // Render Citizens Pages
  // ========================

  const renderCitizenPages = () => {
    switch (currentPage) {
      case "login":
  return (
    <div className="auth-section">
      <CitizenLogin
        onLogin={handleCitizenLogin}
        onRegisterClick={() => goToPage("register")}
      />

      <p className="auth-toggle">
        Don't have an account?{" "}
        <button
          className="link-button"
          onClick={() => goToPage("register")}
        >
          Register
        </button>
      </p>

      <p className="auth-toggle">
        Are you an admin?{" "}
        <button
          className="link-button"
          onClick={() => goToAuthPage("admin-login")}
        >
          Admin Login
        </button>{" "}
        | Department?{" "}
        <button
          className="link-button"
          onClick={() => goToAuthPage("dept-login")}
        >
          Department Login
        </button>
      </p>
    </div>
  );

      case "register":
        return (
          <div className="auth-section">
            <CitizenRegister onRegisterSuccess={handleCitizenRegister} />
            <p className="auth-toggle">
              Already have an account?{" "}
              <button
                className="link-button"
                onClick={() => goToPage("login")}
              >
                Login
              </button>
            </p>
          </div>
        );

      case "dashboard":
        return (
          <CitizenDashboard
            navigate={goToPage}
            userName={user?.name}
          />
        );

      case "post":
        return (
          <PostComplaint
            citizenId={user?.id}
            onSubmitSuccess={() => goToPage("my")}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      case "track":
        return (
          <TrackComplaint
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      case "my":
        return (
          <MyComplaints
            citizenId={user?.id}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      case "profile":
        return (
          <CitizenProfile
            citizenId={user?.id}
            onLogout={handleLogout}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      default:
        return (
          <CitizenDashboard
            navigate={goToPage}
            userName={user?.name}
          />
        );
    }
  };

  // ========================
  // Render Admin Pages
  // ========================

  const renderAdminPages = () => {
    switch (currentPage) {
      case "login":
        return (
          <div className="auth-section">
            <AdminLogin onLogin={handleAdminLogin} />
            <p className="auth-toggle">
              Are you a citizen?{" "}
              <button
                className="link-button"
                onClick={() => goToAuthPage("citizen-login")}
              >
                Citizen Login
              </button>{" "}
              | Department?{" "}
              <button
                className="link-button"
                onClick={() => goToAuthPage("dept-login")}
              >
                Department Login
              </button>
            </p>
          </div>
        );

      case "dashboard":
        return <AdminDashboard navigate={goToPage} />;

      case "validate":
        return (
          <ComplaintValidation
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      case "restricted":
        return (
          <RestrictedUsers
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      default:
        return <AdminDashboard navigate={goToPage} />;
    }
  };

  // ========================
  // Render Department Pages
  // ========================

  const renderDepartmentPages = () => {
    switch (currentPage) {
      case "login":
  return (
    <div className="auth-section">
      <DepartmentLogin onLogin={handleDepartmentLogin} />

      <p className="auth-toggle">
        Are you a citizen?{" "}
        <button
          className="link-button"
          onClick={() => goToAuthPage("citizen-login")}
        >
          Citizen Login
        </button>{" "}
        | Admin?{" "}
        <button
          className="link-button"
          onClick={() => goToAuthPage("admin-login")}
        >
          Admin Login
        </button>
      </p>
    </div>
  );

      case "dashboard":
        return (
          <DepartmentDashboard
            navigate={goToPage}
            departmentName={user?.name}
          />
        );

      case "details":
        return (
          <ComplaintDetails
            complaintId={pageData}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );

      default:
        return (
          <DepartmentDashboard
            navigate={goToPage}
            departmentName={user?.name}
          />
        );
    }
  };

  // ========================
  // Render Login/Role Selection
  // ========================

  const renderLoginSelection = () => {
    return (
      <div className="role-selection">
        <div className="role-header">
          <h1>Citizen Complaint Management System</h1>
          <p>Select Your Role to Login</p>
        </div>

        <div className="role-cards">
          <div
            className="role-card"
            onClick={() => selectRole(ROLES.CITIZEN)}
          >
            <div className="role-icon">👤</div>
            <h3>Citizen</h3>
            <p>Submit and track complaints</p>
          </div>

          <div
            className="role-card"
            onClick={() => selectRole(ROLES.ADMIN)}
          >
            <div className="role-icon">👨‍💼</div>
            <h3>Admin</h3>
            <p>Validate complaints</p>
          </div>

          <div
            className="role-card"
            onClick={() => selectRole(ROLES.DEPARTMENT)}
          >
            <div className="role-icon">🏢</div>
            <h3>Department</h3>
            <p>Manage assigned work</p>
          </div>
        </div>
      </div>
    );
  };

  // ========================
  // Main Render
  // ========================

  let pageContent;
if (!role) {
  pageContent = renderLoginSelection();
} else if (role === ROLES.CITIZEN) {
  pageContent = renderCitizenPages();
} else if (role === ROLES.ADMIN) {
  pageContent = renderAdminPages();
} else if (role === ROLES.DEPARTMENT) {
  pageContent = renderDepartmentPages();
}

  return (
    <>
      <Navbar 
        role={role} 
        onLogout={handleLogout}
        currentPage={currentPage}
      />
      <main className="main-content">
        {pageContent}
      </main>
      <Footer />
    </>
  );
}
