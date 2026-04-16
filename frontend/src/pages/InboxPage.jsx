import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import EmailCard from "../components/email/EmailCard";
import api from "../utils/api";

export default function InboxPage() {
  const { user, setUserFromId } = useAuth();
  const [searchParams] = useSearchParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId && !user) {
      setUserFromId(userId);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchEmails();
  }, [user]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/emails/?user_id=${user.id}&max_results=30`);
      setEmails(res.data.emails || []);
    } catch (err) {
      setError("Failed to load emails. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = emails.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.subject?.toLowerCase().includes(q) ||
      e.sender?.toLowerCase().includes(q) ||
      e.snippet?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar title="Inbox" onSearch={setSearch} />
        <div style={styles.content}>
          {loading && (
            <div style={styles.center}>
              <motion.div
                style={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p style={styles.loadingText}>Loading your emails...</p>
            </div>
          )}

          {error && !loading && (
            <div style={styles.center}>
              <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>
              <button className="btn-primary" onClick={fetchEmails} style={{ marginTop: 16 }}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <AnimatePresence>
              {filtered.length === 0 ? (
                <motion.div
                  style={styles.center}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    {search ? "No emails match your search." : "Your inbox is empty."}
                  </p>
                </motion.div>
              ) : (
                <div style={styles.list}>
                  {filtered.map((email, i) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      scanResult={null}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
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
    padding: "20px 28px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 12,
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid var(--glass-border)",
    borderTop: "3px solid var(--accent)",
  },
  loadingText: {
    fontSize: 14,
    color: "var(--text-muted)",
  },
};