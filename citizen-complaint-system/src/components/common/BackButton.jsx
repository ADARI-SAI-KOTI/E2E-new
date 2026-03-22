/**
 * BACK BUTTON
 * Reusable back navigation button for non-dashboard pages
 * Provides consistent UX across all modules
 * 
 * TODO: When React Router is implemented, replace with useNavigate hook
 */
export default function BackButton({ onBack, canGoBack, label = "Back to Dashboard" }) {
  if (!canGoBack) {
    return null;
  }

  return (
    <div className="back-button-container">
      <button 
        className="btn-back-page" 
        onClick={onBack}
        title={label}
        aria-label={label}
      >
        ← {label}
      </button>
    </div>
  );
}
