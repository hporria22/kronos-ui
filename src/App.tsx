import React from "react";
import {  Routes, Route, Navigate, useLocation } from "react-router-dom";
import {  useAuth } from "./lib/auth";
import Login from "./pages/login";
import Layout from "./components/layout";
import Dashboard from "./pages/dashboard";
import Reports from "./pages/reports";
import Queries from "./pages/queries";
import Validation from "./pages/validation";
import Profile from "./pages/profile";

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
};

const RedirectIfAuthed: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return children;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="queries" element={<Queries />} />
        <Route path="validation" element={<Validation />} />
        <Route path="profile" element={<Profile />} />
      
      </Route>
    </Routes>
  );
  // also drop the unused Toaster import/usage here, or move it up to main.tsx if you prefer it global
};

export default App;