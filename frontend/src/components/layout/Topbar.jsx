import { motion } from "framer-motion";
import { Moon, Sun, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";

export default function Topbar({ title, onSearch }) {
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <motion.header
      style={styles.topbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 style={styles.title}>{title}</h1>

      <div style={styles.right}>
        <div style={styles.searchWrap}>
          <Search size={15} color="var(--text-muted)" style={styles.searchIcon} />
          <input
            className="glass-input"
            style={styles.searchInput}
            placeholder="Search emails..."
            value={query}
            onChange={handleSearch}
          />
        </div>

        <motion.button
          className="btn-ghost"
          style={styles.themeBtn}
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
      </div>
    </motion.header>
  );
}

const styles = {
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    borderBottom: "1px solid var(--glass-border)",
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    pointerEvents: "none",
  },
  searchInput: {
    paddingLeft: 36,
    width: 260,
    borderRadius: 999,
  },
  themeBtn: {
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
  },
};