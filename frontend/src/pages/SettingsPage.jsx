import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { Moon, Sun, Shield, Mail, Tag, Archive, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SettingRow({ icon: Icon, title, description, control }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowLeft}>
        <div style={styles.rowIcon}>
          <Icon size={16} color="var(--accent)" />
        </div>
        <div style={styles.rowText}>
          <span style={styles.rowTitle}>{title}</span>
          <span style={styles.rowDesc}>{description}</span>
        </div>
      </div>
      <div style={styles.rowControl}>{control}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <motion.button
      style={{
        ...styles.toggle,
        background: value
          ? "var(--accent)"
          : "var(--glass-border)",
        justifyContent: value ? "flex-end" : "flex-start",
      }}
      onClick={() => onChange(!value)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        style={styles.toggleThumb}
        layout
        transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar title="Settings" />
        <div style={styles.content}>

          <div className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Account</h2>
            {user && (
              <div style={styles.accountRow}>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    style={styles.avatar}
                  />
                )}
                <div style={styles.accountInfo}>
                  <span style={styles.accountName}>{user.name}</span>
                  <span style={styles.accountEmail}>{user.email}</span>
                </div>
                <motion.button
                  className="btn-ghost"
                  style={styles.signOutBtn}
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Out
                </motion.button>
              </div>
            )}
          </div>

          <div className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Appearance</h2>
            <SettingRow
              icon={isDark ? Moon : Sun}
              title="Dark Mode"
              description="Switch between light and dark interface"
              control={<Toggle value={isDark} onChange={toggleTheme} />}
            />
          </div>

          <div className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Features</h2>
            <SettingRow
              icon={Shield}
              title="Scan new emails on login"
              description="Automatically scan new emails when you open SmartInbox"
              control={<Toggle value={true} onChange={() => {}} />}
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Zap}
              title="AI Summaries"
              description="Summarize long emails into 2 lines using Groq AI"
              control={<Toggle value={true} onChange={() => {}} />}
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Tag}
              title="Color coded badges"
              description="Show color indicators based on email type"
              control={<Toggle value={true} onChange={() => {}} />}
            />
          </div>

          <div className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Quick Navigation</h2>
            <div style={styles.quickLinks}>
              {[
                { icon: Mail, label: "Go to Inbox", path: "/inbox" },
                { icon: Archive, label: "Go to Archive", path: "/archive" },
                { icon: Tag, label: "Manage Categories", path: "/categories" },
              ].map(({ icon: Icon, label, path }) => (
                <motion.button
                  key={path}
                  className="btn-ghost"
                  style={styles.quickLink}
                  onClick={() => navigate(path)}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon size={15} color="var(--accent)" />
                  <span>{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>About</h2>
            <div style={styles.aboutGrid}>
              <div style={styles.aboutItem}>
                <span style={styles.aboutLabel}>Version</span>
                <span style={styles.aboutValue}>1.0.0</span>
              </div>
              <div style={styles.aboutItem}>
                <span style={styles.aboutLabel}>AI Model</span>
                <span style={styles.aboutValue}>Llama 3.1 via Groq</span>
              </div>
              <div style={styles.aboutItem}>
                <span style={styles.aboutLabel}>Email Provider</span>
                <span style={styles.aboutValue}>Gmail API</span>
              </div>
              <div style={styles.aboutItem}>
                <span style={styles.aboutLabel}>Built with</span>
                <span style={styles.aboutValue}>React + FastAPI</span>
              </div>
            </div>
          </div>

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
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 700,
    width: "100%",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  accountRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    flexShrink: 0,
  },
  accountInfo: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  accountEmail: {
    fontSize: 13,
    color: "var(--text-muted)",
  },
  signOutBtn: {
    fontSize: 13,
    padding: "8px 16px",
    color: "var(--danger)",
    borderColor: "var(--danger)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "var(--accent-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  rowDesc: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  rowControl: {
    flexShrink: 0,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "0 3px",
    transition: "background 0.2s ease",
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  },
  divider: {
    height: 1,
    background: "var(--glass-border)",
  },
  quickLinks: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  quickLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    padding: "10px 14px",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  aboutItem: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  aboutLabel: {
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  aboutValue: {
    fontSize: 13,
    color: "var(--text-primary)",
    fontWeight: 500,
  },
};