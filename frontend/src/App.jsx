import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import PageTransition from "./components/layout/PageTransition";
import LoginPage from "./pages/LoginPage";
import InboxPage from "./pages/InboxPage";
import EmailDetailPage from "./pages/EmailDetailPage";
import ArchivePage from "./pages/ArchivePage";
import CategoriesPage from "./pages/CategoriesPage";
import SettingsPage from "./pages/SettingsPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  if (loading) return null;
  const userId = searchParams.get("user_id");
  if (!user && !userId) return <Navigate to="/" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <PageTransition>
                <InboxPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/email/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <EmailDetailPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ArchivePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CategoriesPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageTransition>
                <SettingsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}