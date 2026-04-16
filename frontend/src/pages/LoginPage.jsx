import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Mail, Shield, Zap, Star } from "lucide-react";

export default function LoginPage() {
  const { user, login, loading, setUserFromId } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      setUserFromId(userId)
        .then(() => {
          navigate("/inbox", { replace: true });
        })
        .catch((err) => {
          console.error("Failed to set user:", err);
        });
    }
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/inbox");
  }, [user, loading]);

  const features = [
    { icon: Shield, text: "Smart threat detection" },
    { icon: Zap, text: "AI email summaries" },
    { icon: Star, text: "Priority inbox management" },
    { icon: Mail, text: "Sponsor and job detection" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />
      <div style={styles.bgBlob3} />

      <motion.button
        className="btn-ghost"
        style={styles.themeToggle}
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.button>

      <div style={styles.content}>
        <motion.div
          className="glass-card"
          style={styles.card}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            style={styles.logoWrap}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div style={styles.logoCircle}>
              <Mail size={28} color="white" />
            </div>
          </motion.div>

          <motion.h1
            style={styles.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            SmartInbox
          </motion.h1>

          <motion.p
            style={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your intelligent email companion. Clean, secure, and always aware.
          </motion.p>

          <motion.div
            style={styles.features}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                style={styles.featureRow}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <div style={styles.featureIcon}>
                  <Icon size={14} color="var(--accent)" />
                </div>
                <span style={styles.featureText}>{text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            className="btn-primary"
            style={styles.loginBtn}
            onClick={login}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <motion.p
            style={styles.disclaimer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            We only read your emails to provide SmartInbox features. Your data is never sold or shared.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bgBlob1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
    top: -100,
    right: -100,
    animation: "blob 8s ease-in-out infinite",
  },
  bgBlob2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
    background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)",
    bottom: -80,
    left: -80,
    animation: "blob 10s ease-in-out infinite reverse",
  },
  bgBlob3: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
    top: "50%",
    left: "30%",
    animation: "blob 12s ease-in-out infinite",
  },
  themeToggle: {
    position: "absolute",
    top: 24,
    right: 24,
    display: "flex",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  content: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 420,
    padding: "0 20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 0,
  },
  logoWrap: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent), #818cf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: 10,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 15,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  features: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 28,
    textAlign: "left",
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "var(--accent-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  loginBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    padding: "14px 24px",
    fontSize: 15,
  },
  disclaimer: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.6,
    maxWidth: 300,
  },
};