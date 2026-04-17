import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

export default function ScanButton({ emailId, userId, onResult }) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.stopPropagation();
    if (scanning || scanned) return;
    setScanning(true);

    try {
      const res = await fetch(
        `http://localhost:8000/scan/single?message_id=${emailId}&user_id=${userId}`,
        { method: "POST" }
      );
      const data = await res.json();
      setResult(data);
      setScanned(true);
      if (onResult) onResult(emailId, data);
    } catch {
      setResult(null);
    } finally {
      setScanning(false);
    }
  };

  const getIcon = () => {
    if (!scanned) return Shield;
    if (result?.is_suspicious) return ShieldAlert;
    return ShieldCheck;
  };

  const getColor = () => {
    if (!scanned) return "var(--text-muted)";
    return result?.color_code || "var(--accent)";
  };

  const Icon = getIcon();

  return (
    <div style={styles.wrap}>
      <motion.button
        style={{
          ...styles.btn,
          color: getColor(),
          borderColor: scanned ? getColor() : "var(--glass-border)",
        }}
        onClick={handleScan}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={scanned ? result?.reason : "Scan this email"}
      >
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div
              key="scanning"
              style={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={15} />
            </motion.div>
          )}
        </AnimatePresence>

        {scanning && (
          <>
            <motion.div
              style={{
                ...styles.ring,
                borderColor: "var(--accent)",
              }}
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              style={{
                ...styles.ring,
                borderColor: "var(--accent)",
              }}
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {scanned && result && (
          <motion.span
            style={{
              ...styles.label,
              color: getColor(),
            }}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {result.is_suspicious
              ? "Suspicious"
              : result.is_important
              ? "Important"
              : result.is_job
              ? "Career"
              : result.is_sponsor
              ? "Sponsored"
              : "Safe"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  btn: {
    position: "relative",
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    overflow: "visible",
  },
  spinner: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "2px solid var(--glass-border)",
    borderTop: "2px solid var(--accent)",
  },
  ring: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "1px solid",
    pointerEvents: "none",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
};