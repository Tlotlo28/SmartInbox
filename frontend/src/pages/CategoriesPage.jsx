import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../utils/api";
import { Plus, Trash2, Mail, Tag, ChevronDown, ChevronUp } from "lucide-react";

const PRESET_COLORS = [
  "#6366f1", "#22c55e", "#ef4444", "#f59e0b",
  "#06b6d4", "#ec4899", "#8b5cf6", "#14b8a6"
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [addingAddress, setAddingAddress] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/categories/?user_id=${user.id}`);
      setCategories(res.data.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await api.post(`/categories/?user_id=${user.id}`, {
        name: newCatName.trim(),
        color: newCatColor,
      });
      setCategories((prev) => [...prev, res.data]);
      setNewCatName("");
      setNewCatColor("#6366f1");
      setShowNewCategory(false);
    } catch {
      alert("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}?user_id=${user.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category.");
    }
  };

  const handleAddAddress = async (categoryId) => {
    if (!newEmail.trim()) return;
    try {
      const res = await api.post(
        `/categories/${categoryId}/addresses?user_id=${user.id}`,
        { email_address: newEmail.trim(), label: newLabel.trim() || null }
      );
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, addresses: [...c.addresses, res.data] }
            : c
        )
      );
      setNewEmail("");
      setNewLabel("");
      setAddingAddress(null);
    } catch {
      alert("Failed to add address.");
    }
  };

  const handleDeleteAddress = async (categoryId, addressId) => {
    try {
      await api.delete(`/categories/addresses/${addressId}?user_id=${user.id}`);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, addresses: c.addresses.filter((a) => a.id !== addressId) }
            : c
        )
      );
    } catch {
      alert("Failed to delete address.");
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar title="Categories" />
        <div style={styles.content}>
          <div style={styles.header}>
            <p style={styles.subtitle}>
              Organise important email addresses into categories. Emails from
              these addresses will be flagged automatically.
            </p>
            <motion.button
              className="btn-primary"
              style={styles.newBtn}
              onClick={() => setShowNewCategory(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={15} />
              New Category
            </motion.button>
          </div>

          <AnimatePresence>
            {showNewCategory && (
              <motion.div
                className="glass-card"
                style={styles.newCatCard}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 style={styles.newCatTitle}>Create Category</h3>
                <input
                  className="glass-input"
                  placeholder="Category name (e.g. Work, Family, Insurance)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                />
                <div style={styles.colorRow}>
                  <span style={styles.colorLabel}>Colour</span>
                  <div style={styles.colorOptions}>
                    {PRESET_COLORS.map((color) => (
                      <motion.button
                        key={color}
                        style={{
                          ...styles.colorDot,
                          background: color,
                          outline: newCatColor === color
                            ? `3px solid ${color}`
                            : "none",
                          outlineOffset: 2,
                        }}
                        onClick={() => setNewCatColor(color)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>
                <div style={styles.newCatActions}>
                  <button
                    className="btn-ghost"
                    onClick={() => setShowNewCategory(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleCreateCategory}
                    disabled={!newCatName.trim()}
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div style={styles.center}>
              <motion.div
                style={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {!loading && categories.length === 0 && !showNewCategory && (
            <div style={styles.center}>
              <Tag size={40} color="var(--text-muted)" />
              <p style={styles.emptyText}>No categories yet.</p>
              <p style={styles.emptySubtext}>
                Create a category to organise your important contacts.
              </p>
            </div>
          )}

          <div style={styles.list}>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                className="glass"
                style={styles.catCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={styles.catHeader}>
                  <div style={styles.catLeft}>
                    <div
                      style={{
                        ...styles.catColorDot,
                        background: cat.color,
                        boxShadow: `0 0 8px ${cat.color}60`,
                      }}
                    />
                    <span style={styles.catName}>{cat.name}</span>
                    <span style={styles.catCount}>
                      {cat.addresses.length} address{cat.addresses.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div style={styles.catActions}>
                    <motion.button
                      style={styles.iconBtn}
                      onClick={() => toggleExpand(cat.id)}
                      whileHover={{ scale: 1.1 }}
                    >
                      {expanded[cat.id]
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />}
                    </motion.button>
                    <motion.button
                      style={{ ...styles.iconBtn, color: "var(--danger)" }}
                      onClick={() => handleDeleteCategory(cat.id)}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded[cat.id] && (
                    <motion.div
                      style={styles.addressSection}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div style={styles.addressList}>
                        {cat.addresses.map((addr) => (
                          <div key={addr.id} style={styles.addressRow}>
                            <Mail size={13} color="var(--text-muted)" />
                            <div style={styles.addressInfo}>
                              <span style={styles.addressEmail}>
                                {addr.email_address}
                              </span>
                              {addr.label && (
                                <span style={styles.addressLabel}>
                                  {addr.label}
                                </span>
                              )}
                            </div>
                            <motion.button
                              style={{
                                ...styles.iconBtn,
                                color: "var(--danger)",
                              }}
                              onClick={() =>
                                handleDeleteAddress(cat.id, addr.id)
                              }
                              whileHover={{ scale: 1.1 }}
                            >
                              <Trash2 size={13} />
                            </motion.button>
                          </div>
                        ))}
                      </div>

                      {addingAddress === cat.id ? (
                        <motion.div
                          style={styles.addAddressForm}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <input
                            className="glass-input"
                            placeholder="Email address"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            style={{ fontSize: 13 }}
                          />
                          <input
                            className="glass-input"
                            placeholder="Label (optional)"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            style={{ fontSize: 13 }}
                          />
                          <div style={styles.addAddressActions}>
                            <button
                              className="btn-ghost"
                              style={{ fontSize: 12, padding: "6px 12px" }}
                              onClick={() => {
                                setAddingAddress(null);
                                setNewEmail("");
                                setNewLabel("");
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-primary"
                              style={{ fontSize: 12, padding: "6px 12px" }}
                              onClick={() => handleAddAddress(cat.id)}
                              disabled={!newEmail.trim()}
                            >
                              Add
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          style={styles.addAddressBtn}
                          onClick={() => setAddingAddress(cat.id)}
                          whileHover={{ color: "var(--accent)" }}
                        >
                          <Plus size={13} />
                          Add email address
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
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
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  subtitle: {
    fontSize: 13,
    color: "var(--text-muted)",
    lineHeight: 1.6,
    maxWidth: 500,
  },
  newBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    padding: "10px 18px",
    flexShrink: 0,
  },
  newCatCard: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  newCatTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  colorLabel: {
    fontSize: 13,
    color: "var(--text-muted)",
    fontWeight: 500,
    width: 44,
  },
  colorOptions: {
    display: "flex",
    gap: 8,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
  },
  newCatActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  emptySubtext: {
    fontSize: 13,
    color: "var(--text-muted)",
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "3px solid var(--glass-border)",
    borderTop: "3px solid var(--accent)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  catCard: {
    borderRadius: 14,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflow: "hidden",
  },
  catHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  catColorDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    flexShrink: 0,
  },
  catName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  catCount: {
    fontSize: 12,
    color: "var(--text-muted)",
    background: "var(--glass-bg)",
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid var(--glass-border)",
  },
  catActions: {
    display: "flex",
    gap: 4,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addressSection: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid var(--glass-border)",
  },
  addressList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  addressRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 0",
  },
  addressInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  addressEmail: {
    fontSize: 13,
    color: "var(--text-primary)",
    fontWeight: 500,
  },
  addressLabel: {
    fontSize: 11,
    color: "var(--text-muted)",
  },
  addAddressForm: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  addAddressActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  addAddressBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    padding: "6px 0",
    transition: "color 0.15s ease",
  },
};