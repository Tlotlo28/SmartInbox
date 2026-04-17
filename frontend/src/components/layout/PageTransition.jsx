import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.div
      style={{ width: "100%", height: "100%" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
