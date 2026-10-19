import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { Layout } from "./components/Layout";
import { CatalogSession } from "./pages/Catalog";
import { Dashboard } from "./pages/Dashboard";
import { SheetTracker } from "./pages/SheetTracker";
import { Login } from "./pages/Login";
import { Progress } from "./pages/Progress";
import { Register } from "./pages/Register";
import { Submission } from "./pages/Submission";
import { Workspace } from "./pages/Workspace";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted">Loading your desk…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/sheet" element={<SheetTracker />} />
        <Route path="/catalog" element={<Navigate to="/sheet" replace />} />
        <Route path="/catalog/:source/:slug" element={<CatalogSession />} />
        <Route path="/problems/:slug" element={<Workspace />} />
        <Route path="/submissions/:id" element={<Submission />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
