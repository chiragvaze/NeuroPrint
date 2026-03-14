import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PatientUploadPage from "./pages/PatientUploadPage";
import TrialDatabasePage from "./pages/TrialDatabasePage";
import MatchResultsDashboardPage from "./pages/MatchResultsDashboardPage";
import BatchProcessingPage from "./pages/BatchProcessingPage";
import AppLayout from "./components/AppLayout";
import FloatingAIChatbot from "./components/FloatingAIChatbot";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent-teal animate-spin" />
          <p className="text-sm font-medium text-slate-400">Checking secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  return children;
};

const DashboardApp = () => {
  const [activePage, setActivePage] = useState("results");
  const { user, logout } = useAuth();

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      user={user}
      onLogout={logout}
    >
      <div className="animate-fadeInUp">
        {activePage === "patients" ? <PatientUploadPage /> : null}
        {activePage === "trials" ? <TrialDatabasePage /> : null}
        {activePage === "results" ? <MatchResultsDashboardPage /> : null}
        {activePage === "batch" ? <BatchProcessingPage /> : null}
      </div>

      <FloatingAIChatbot />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardApp />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
