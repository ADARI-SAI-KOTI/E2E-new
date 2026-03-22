/**
 * CITIZEN DASHBOARD
 * Main landing page for citizens after login
 * Navigation hub to all citizen functions
 */
export default function CitizenDashboard({ navigate, userName }) {
  const menuItems = [
    {
      id: "post",
      title: "Post Complaint",
      icon: "📝",
      description: "Lodge a new complaint about public services",
      color: "#667eea"
    },
    {
      id: "track",
      title: "Track Complaint",
      icon: "🔍",
      description: "Check status of your complaint",
      color: "#764ba2"
    },
    {
      id: "my",
      title: "My Complaints",
      icon: "📋",
      description: "View all your submitted complaints",
      color: "#f093fb"
    },
    {
      id: "profile",
      title: "My Profile",
      icon: "👤",
      description: "Manage your account information",
      color: "#4facfe"
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome{userName ? `, ${userName}` : ""}!</h2>
        <p>Citizen Complaint Management System</p>
      </div>

      <div className="dashboard-intro">
        <p>
          This platform allows you to report issues in your area and track their progress.
          Our goal is to improve public services through citizen feedback.
        </p>
      </div>

      <div className="grid">
        {menuItems.map(item => (
          <div
            key={item.id}
            className="menu-card"
            onClick={() => navigate(item.id)}
            style={{ borderLeftColor: item.color }}
          >
            <div className="card-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <h3>Quick Information</h3>
        <div className="info-section">
          <h4>📌 How to File a Complaint</h4>
          <ol>
            <li>Click "Post Complaint"</li>
            <li>Select the category and provide details</li>
            <li>Add evidence (image) and location</li>
            <li>Submit for admin validation</li>
            <li>Track progress using your complaint ID</li>
          </ol>
        </div>

        <div className="info-section">
          <h4>⏱️ Expected Timeline</h4>
          <ul>
            <li><strong>Admin Validation:</strong> 1-2 days</li>
            <li><strong>Department Assignment:</strong> 1-3 days</li>
            <li><strong>Resolution:</strong> 15-30 days</li>
          </ul>
        </div>

        <div className="info-section">
          <h4>📞 Support</h4>
          <p>Email: support@complaints.gov | Phone: 1800-COMPLAINT</p>
        </div>
      </div>
    </div>
  );
}
