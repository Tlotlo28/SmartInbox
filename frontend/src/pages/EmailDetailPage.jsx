import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Archive, AlertTriangle, Briefcase, Tag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../utils/api";
import { formatFullDate } from "../utils/dateHelpers";

export default function EmailDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  const userId = searchParams.get("user_id") || user?.id;

  useEffect(() => {
    if (!userId) return;
    fetchEmail();
  }, [userId, id]);

  const fetchEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/emails/${id}?user_id=${userId}`);
      setEmail(res.data);
    } catch (err) {
      setError("Failed to load email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!email) return;
    setSummarizing(true);
    try {
      const res = await api.post("/emails/summarize", {
        email_body: email.body || email.snippet,
        subject: email.subject,
      });
      setSummary(res.data.summary);
    } catch {
      setSummary("Could not generate summary. Please try again.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleArchive = async () => {
    try {
      await api.post(`/archive/?user_id=${userId}`, {
        gmail_message_id: email.id,
        subject: email.subject,
        sender: email.sender,
        snippet: email.snippet,
      });
      navigate("/archive");
    } catch {
      alert("Failed to archive email.");
    }
  };

  const renderBody = (body) => {
    if (!body) return <p style={{ color: "var(--text-muted)" }}>No content.</p>;
    if (body.includes("<html") || body.includes("<div") || body.includes("<p")) {
      return (
        <iframe
          srcDoc={body}
          style={styles.iframe}
          title="Email content"
          sandbox="allow-same-origin"
        />
      );
    }
    return (
      <pre style={styles.plainText}>{body}</pre>
    );
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar title="Email" />
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

          {error && !loading && (
            <div style={styles.center}>
              <p style={{ color: "var(--danger)" }}>{error}</p>
            </div>
          )}

          {!loading && !error && email && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div style={styles.header}>
                <motion.button
                  style={styles.backBtn}
                  onClick={() => navigate(-1)}
                  whileHover={{ x: -3 }}
                  transition={{ duration: 0.15 }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </motion.button>

                <div style={styles.actions}>
                  <motion.button
                    className="btn-ghost"
                    style={styles.actionBtn}
                    onClick={handleArchive}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Archive size={15} />
                    <span>Archive</span>
                  </motion.button>
                </div>
              </div>

              <div className="glass-card" style={styles.emailCard}>
                <h2 style={styles.subject}>{email.subject || "(no subject)"}</h2>

                <div style={styles.meta}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>From</span>
                    <span style={styles.metaValue}>{email.sender}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Date</span>
                    <span style={styles.metaValue}>{formatFullDate(email.date)}</span>
                  </div>
                </div>

                {summary && (
                  <motion.div
                    style={styles.summaryBox}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={styles.summaryHeader}>
                      <Tag size={14} color="var(--accent)" />
                      <span style={styles.summaryTitle}>AI Summary</span>
                    </div>
                    <p style={styles.summaryText}>{summary}</p>
                  </motion.div>
                )}

                <div style={styles.bodyWrap}>
                  {renderBody(email.body)}
                </div>
              </div>

              <div style={styles.bottomActions}>
                <motion.button
                  className="btn-primary"
                  style={styles.summarizeBtn}
                  onClick={handleSummarize}
                  disabled={summarizing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {summarizing ? "Summarizing..." : "Summarize with AI"}
                </motion.button>
              </div>
            </motion.div>
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
    padding: "24px 32px",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid var(--glass-border)",
    borderTop: "3px solid var(--accent)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    padding: "6px 0",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    padding: "8px 14px",
  },
  emailCard: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  subject: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "16px 0",
    borderTop: "1px solid var(--glass-border)",
    borderBottom: "1px solid var(--glass-border)",
  },
  metaRow: {
    display: "flex",
    gap: 12,
    fontSize: 13,
  },
  metaLabel: {
    color: "var(--text-muted)",
    fontWeight: 500,
    width: 40,
    flexShrink: 0,
  },
  metaValue: {
    color: "var(--text-secondary)",
  },
  summaryBox: {
    background: "var(--accent-light)",
    border: "1px solid var(--accent)",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--accent)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  summaryText: {
    fontSize: 14,
    color: "var(--text-primary)",
    lineHeight: 1.6,
  },
  bodyWrap: {
    minHeight: 200,
  },
  iframe: {
    width: "100%",
    height: 500,
    border: "none",
    borderRadius: 8,
  },
  plainText: {
    fontSize: 14,
    color: "var(--text-primary)",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  bottomActions: {
    display: "flex",
    gap: 12,
    marginTop: 20,
    paddingBottom: 40,
  },
  summarizeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
  },
};