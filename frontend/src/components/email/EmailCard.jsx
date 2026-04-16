import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ColorBadge from "./ColorBadge";
import { formatEmailDate } from "../../utils/dateHelpers";

export default function EmailCard({ email, scanResult, index }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isUnread = email.labels?.includes("UNREAD");

  return (
    <motion.div
      style={{
        ...styles.card,
        background: isUnread ? "var(--glass-bg-hover)" : "var(--glass-bg)",
      }}
      className="glass"
      onClick={() => navigate(`/email/${email.id}?user_id=${user?.id}`)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      whileHover={{
        scale: 1.005,
        background: "var(--glass-bg-hover)",
      }}
    >
      <div style={styles.left}>
        <ColorBadge scanResult={scanResult} />
        <div style={styles.info}>
          <span style={{
            ...styles.sender,
            fontWeight: isUnread ? 700 : 500,
          }}>
            {email.sender?.replace(/<.*>/, "").trim() || "Unknown"}
          </span>
          <span style={styles.subject}>
            {email.subject || "(no subject)"}
          </span>
          <span style={styles.snippet}>{email.snippet}</span>
        </div>
      </div>
      <div style={styles.right}>
        <span style={styles.date}>{formatEmailDate(email.date)}</span>
        {isUnread && <div style={styles.unreadDot} />}
      </div>
    </motion.div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderRadius: 12,
    cursor: "pointer",
    gap: 12,
    marginBottom: 6,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    overflow: "hidden",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflow: "hidden",
  },
  sender: {
    fontSize: 13,
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subject: {
    fontSize: 14,
    color: "var(--text-primary)",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  snippet: {
    fontSize: 12,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 500,
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  date: {
    fontSize: 12,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
  },
};