import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import EmailCard from "../components/email/EmailCard";
import ScanButton from "../components/scan/ScanButton";
import ScanProgress from "../components/scan/ScanProgress";
import api from "../utils/api";
import { Shield } from "lucide-react";

export default function InboxPage() {
  const { user, setUserFromId } = useAuth();
  const [searchParams] = useSearchParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [scanResults, setScanResults] = useState({});
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [scanCancelled, setScanCancelled] = useState(false);

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
    } catch {
      setError("Failed to load emails. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleScanResult = (emailId, result) => {
    setScanResults((prev) => ({ ...prev, [emailId]: result }));
  };

  const handleScanAll = async () => {
    if (!user || emails.length === 0) return;
    setScanning(true);
    setScanCancelled(false);
    setScanProgress({ current: 0, total: emails.length });

    const newResults = {};

    for (let i = 0; i < emails.length; i++) {
      if (scanCancelled) break;

      const email = emails[i];
      setScanProgress({ current: i + 1, total: emails.length });

      try {
        const res = await fetch(
          `http://localhost:8000/scan/single?message_id=${email.id}&user_id=${user.id}`,
          { method: "POST" }
        );
        const data = await res.json();
        newResults[email.id] = data;
        setScanResults((prev) => ({ ...prev, [email.id]: data }));
      } catch {
        // skip failed scan
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    setScanning(false);
  };

  const handleCancelScan = () => {
    setScanCancelled(true);
    setScanning(false);
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

        <div style={styles.toolbar}>
          <span style={styles.count}>
            {emails.length} emails
          </span>
          <motion.button
            className="btn-ghost"
            style={styles.scanAllBtn}
            onClick={handleScanAll}
            disabled={scanning || loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Shield size={15} />
            Scan All Emails
          </motion.button>
        </div>

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
              <button
                className="btn-primary"
                onClick={fetchEmails}
                style={{ marginTop: 16 }}
              >
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
                    <div key={email.id} style={styles.emailRow}>
                      <div style={styles.emailCardWrap}>
                        <EmailCard
                          email={email}
                          scanResult={scanResults[email.id] || null}
                          index={i}
                        />
                      </div>
                      <ScanButton
                        emailId={email.id}
                        userId={user?.id}
                        onResult={handleSingleScanResult}
                      />
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {scanning && (
          <ScanProgress
            current={scanProgress.current}
            total={scanProgress.total}
            onCancel={handleCancelScan}
          />
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
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 28px",
    borderBottom: "1px solid var(--glass-border)",
  },
  count: {
    fontSize: 13,
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  scanAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    padding: "8px 16px",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 28px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  emailRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  emailCardWrap: {
    flex: 1,
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