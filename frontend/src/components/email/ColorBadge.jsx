import { motion } from "framer-motion";
import { getEmailColorCode } from "../../utils/colorCoding";

export default function ColorBadge({ scanResult }) {
  const code = getEmailColorCode(scanResult);

  return (
    <motion.div
      style={{
        ...styles.badge,
        background: code.color,
        boxShadow: `0 0 8px ${code.color}60`,
      }}
      title={code.description}
      whileHover={{ scale: 1.3 }}
      transition={{ duration: 0.15 }}
    />
  );
}

const styles = {
  badge: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
};