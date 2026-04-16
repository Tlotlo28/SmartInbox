import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("smartinbox_user_id");
    if (userId) {
      api
        .get(`/auth/user/${userId}`)
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("smartinbox_user_id");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = () => {
    api.get("/auth/login").then((res) => {
      window.location.href = res.data.auth_url;
    });
  };

  const logout = async () => {
    if (user) {
      await api.post(`/auth/logout/${user.id}`);
      localStorage.removeItem("smartinbox_user_id");
      setUser(null);
    }
  };

  const setUserFromId = async (userId) => {
    localStorage.setItem("smartinbox_user_id", userId);
    const res = await api.get(`/auth/user/${userId}`);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUserFromId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}