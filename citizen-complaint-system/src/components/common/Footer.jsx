/**
 * FOOTER
 * Common footer displayed across all pages
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h5>Citizen Complaint Management System</h5>
          <p>
            A government platform for citizens to lodge complaints and track their status in real-time.
          </p>
        </div>

        <div className="footer-section">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Contact</h5>
          <p>Email: support@complaints.gov</p>
          <p>Phone: 1800-COMPLAINT (1800-265-7824)</p>
          <p>Hours: 9 AM - 6 PM, Monday - Friday</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Citizen Complaint Management System. All rights reserved.</p>
        <p>Version 1.0 | Government Digital Services</p>
      </div>
    </footer>
  );
}
