import { STATUS_COLORS } from "../../utils/constants";

/**
 * STATUS BADGE
 * Reusable badge component for displaying complaint status
 * Color-coded based on status
 */
export default function StatusBadge({ status, variant = "badge" }) {
  const color = STATUS_COLORS[status] || "#95a5a6";

  if (variant === "badge") {
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: color + "20",
          color: color,
          borderLeft: `4px solid ${color}`
        }}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      style={{
        color: color,
        fontWeight: 600,
        textTransform: "uppercase",
        fontSize: "0.85rem"
      }}
    >
      {status}
    </span>
  );
}
