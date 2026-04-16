import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Inbox, Archive, Star, Settings, LogOut, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/inbox", icon: Inbox, label: "Inbox" },
  { to: "/archive", icon: Archive, label: "Archive" },
  { to: "/categories", icon: Star, label: "Categories" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.aside
      style={styles.sidebar}
      className="glass"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div style={styles.logo}>
        <div style={styles.logoCircle}>
          <Mail size={18} color="white" />
        </div>
        <span style={styles.logoText}>SmartInbox</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <motion.div
                style={{
                  ...styles.navItem,
                  background: isActive ? "var(--accent-light)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                }}
                whileHover={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  x: 4,
                }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={18} />
                <span style={styles.navLabel}>{label}</span>
                {isActive && (
                  <motion.div
                    style={styles.activeBar}
                    layoutId="activeBar"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={styles.bottom}>
        {user && (
          <div style={styles.userInfo}>
            {user.picture && (
              <img src={user.picture} alt={user.name} style={styles.avatar} />
            )}
            <div style={styles.userText}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
          </div>
        )}
        <motion.button
          style={styles.logoutBtn}
          onClick={handleLogout}
          whileHover={{ x: 4, color: "var(--danger)" }}
          transition={{ duration: 0.15 }}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "24px 12px",
    borderRadius: 0,
    borderRight: "1px solid var(--glass-border)",
    flexShrink: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    marginBottom: 32,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent), #818cf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    position: "relative",
    transition: "all 0.15s ease",
  },
  navLabel: {
    flex: 1,
  },
  activeBar: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 3,
    height: 20,
    borderRadius: 2,
    background: "var(--accent)",
  },
  bottom: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    borderTop: "1px solid var(--glass-border)",
    paddingTop: 16,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 4px",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    flexShrink: 0,
  },
  userText: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    fontSize: 11,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  },
};