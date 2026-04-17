import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function ReminderPopup() {
  const { user } = useAuth();
  const [dueReminders, setDueReminders] = useState([]);
  const [current, setCurrent] = useState(null);
  const [snoozeDate, setSnoozeDate] = useState("");
  const [showSnooze, setShowSnooze] = useState(false);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (dueReminders.length > 0 && !current) {
      setCurrent(dueReminders[0]);
    }
  }, [dueReminders]);

  const checkReminders = async () => {
    try {
      const res = await api.get(`/archive/?user_id=${user.id}`);
      const archived = res.data.archived || [];
      const now = new Date();

      const due = archived.filter((item) => {
        if (!item.reminder) return false;
        if (item.reminder.is_dismissed) return false;
        if (item.reminder.is_snoozed) return false;
        const remindAt = new Date(item.reminder.remind_at);
        return remindAt <= now;
      });

      setDueReminders(due);
    } catch {
      // silent fail
    }
  };

  const handleDismiss = () => {
    setCurrent(null);
    setDueReminders((prev) => prev.slice(1));
    setShowSnooze(false);
    setSnoozeDate("");
  };

  const handleSnooze = async () => {
    if (!snoozeDate || !current) return;
    try {
      await api.delete(`/archive/${current.id}?user_id=${user.id}`);
      await api.post(`/archive/?user_id=${user.id}`, {
        gmail_message_id: current.gmail_message_id,
        subject: current.subject,
        sender: current.sender,
        snippet: current.snippet,
        reminder: { remind_at: new Date(snoozeDate).toISOString() },
      });
      handleDismiss();
    } catch {
      handleDismiss();
    }
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        style={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-card"
          style={styles.popup}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div style={styles.header}>
            <div style={styles.iconWrap}>
              <Bell size={20} color="var(--accent)" />
            </div>
            <button style={styles.closeBtn} onClick={handleDismiss}>
              <X size={16} />
            </button>
          </div>

          <h3 style={styles.title}>Email Reminder</h3>
          <p style={styles.subtitle}>You asked to be reminded about this email</p>

          <div style={styles.emailPreview}>
            <span style={styles.previewSender}>
              {current.sender?.replace(/<.*>/, "").trim() || "Unknown"}
            </span>
            <span style={styles.previewSubject}>
              {current.subject || "(no subject)"}
            </span>
            {current.snippet && (
              <span style={styles.previewSnippet}>{current.snippet}</span>
            )}
          </div>

          {showSnooze ? (
            <motion.div
              style={styles.snoozeForm}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                type="datetime-local"
                className="glass-input"
                value={snoozeDate}
                onChange={(e) => setSnoozeDate(e.target.value)}
              />
              <div style={styles.snoozeActions}>
                <button
                  className="btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => setShowSnooze(false)}
                >
                  Back
                </button>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={handleSnooze}
                  disabled={!snoozeDate}
                >
                  Set Reminder
                </button>
              </div>
            </motion.div>
          ) : (
            <div style={styles.actions}>
              <button
                className="btn-ghost"
                style={styles.actionBtn}
                onClick={() => setShowSnooze(true)}
              >
                Remind Me Later
              </button>
              <button
                className="btn-primary"
                style={styles.actionBtn}
                onClick={handleDismiss}
              >
                No Longer Important
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 300,
  },
  popup: {
    width: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "var(--accent-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    borderRadius: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginTop: -6,
  },
  emailPreview: {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  previewSender: {
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  previewSubject: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  previewSnippet: {
    fontSize: 12,
    color: "var(--text-muted)",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  actionBtn: {
    width: "100%",
    fontSize: 13,
    padding: "10px",
  },
  snoozeForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  snoozeActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
};