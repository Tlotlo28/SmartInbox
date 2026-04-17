import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function ScanProgress({ current, total, onCancel }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <motion.div
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-card"
        style={styles.card}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={styles.iconWrap}
        >
          <Shield size={32} color="var(--accent)" />
        </motion.div>

        <h3 style={styles.title}>Scanning Inbox</h3>
        <p style={styles.subtitle}>
          Analysing email {current} of {total}
        </p>

        <div style={styles.barTrack}>
          <motion.div
            style={styles.barFill}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <span style={styles.percent}>{percent}%</span>

        <button className="btn-ghost" style={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  card: {
    width: 340,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    textAlign: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "var(--accent-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginTop: -8,
  },
  barTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    background: "var(--glass-border)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, var(--accent), #818cf8)",
  },
  percent: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--accent)",
  },
  cancelBtn: {
    marginTop: 4,
    fontSize: 13,
  },
};