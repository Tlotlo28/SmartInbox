import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../utils/api";
import { formatFullDate, formatRelativeDate } from "../utils/dateHelpers";
import { Trash2, Bell, BellOff, Mail } from "lucide-react";

export default function ArchivePage() {
  const { user } = useAuth();
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderModal, setReminderModal] = useState(null);
  const [reminderDate, setReminderDate] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchArchived();
  }, [user]);

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/archive/?user_id=${user.id}`);
      setArchived(res.data.archived || []);
    } catch {
      setArchived([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/archive/${id}?user_id=${user.id}`);
      setArchived((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleSetReminder = async () => {
    if (!reminderDate || !reminderModal) return;
    try {
      await api.post(`/archive/?user_id=${user.id}`, {
        gmail_message_id: reminderModal.gmail_message_id,
        subject: reminderModal.subject,
        sender: reminderModal.sender,
        snippet: reminderModal.snippet,
        reminder: { remind_at: new Date(reminderDate).toISOString() },
      });
      setReminderModal(null);
      setReminderDate("");
      fetchArchived();
    } catch {
      alert("Failed to set reminder.");
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar title="Archive" />
        <div style={styles.content}>
          {loading && (
            <div style={styles.center}>
              <motion.div
                style={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {!loading && archived.length === 0 && (
            <div style={styles.center}>
              <Mail size={40} color="var(--text-muted)" />
              <p style={styles.emptyText}>No archived emails yet.</p>
              <p style={styles.emptySubtext}>
                Archive emails from the inbox to keep things tidy.
              </p>
            </div>
          )}

          {!loading && archived.length > 0 && (
            <div style={styles.list}>
              {archived.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="glass"
                  style={styles.card}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div style={styles.cardLeft}>
                    <span style={styles.sender}>
                      {item.sender?.replace(/<.*>/, "").trim() || "Unknown"}
                    </span>
                    <span style={styles.subject}>
                      {item.subject || "(no subject)"}
                    </span>
                    <span style={styles.snippet}>{item.snippet}</span>
                    <div style={styles.cardMeta}>
                      <span style={styles.metaText}>
                        Archived {formatRelativeDate(item.archived_at)}
                      </span>
                      {item.reminder && !item.reminder.is_dismissed && (
                        <span style={styles.reminderBadge}>
                          <Bell size={11} />
                          Reminder: {formatFullDate(item.reminder.remind_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    {!item.reminder && (
                      <motion.button
                        style={styles.iconBtn}
                        title="Set reminder"
                        onClick={() => setReminderModal(item)}
                        whileHover={{ scale: 1.1, color: "var(--accent)" }}
                      >
                        <Bell size={16} />
                      </motion.button>
                    )}
                    <motion.button
                      style={{ ...styles.iconBtn, color: "var(--danger)" }}
                      title="Delete"
                      onClick={() => handleDelete(item.id)}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {reminderModal && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReminderModal(null)}
          >
            <motion.div
              className="glass-card"
              style={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>Set a Reminder</h3>
              <p style={styles.modalSubtitle}>
                When should we remind you about this email?
              </p>
              <input
                type="datetime-local"
                className="glass-input"
                style={styles.dateInput}
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
              />
              <div style={styles.modalActions}>
                <button
                  className="btn-ghost"
                  onClick={() => setReminderModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSetReminder}
                  disabled={!reminderDate}
                >
                  Set Reminder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 32px",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  emptySubtext: {
    fontSize: 13,
    color: "var(--text-muted)",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid var(--glass-border)",
    borderTop: "3px solid var(--accent)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderRadius: 12,
    gap: 16,
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
    overflow: "hidden",
  },
  sender: {
    fontSize: 12,
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  subject: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-primary)",
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
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: "var(--text-muted)",
  },
  reminderBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "var(--accent)",
    fontWeight: 500,
  },
  cardActions: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    width: 380,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginTop: -8,
  },
  dateInput: {
    colorScheme: "dark",
  },
  modalActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
};