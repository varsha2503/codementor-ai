import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm ${isActive ? "bg-accent text-black" : "text-muted hover:text-ink"}`;

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="font-serif text-xl tracking-tight text-ink">
            CodeMentor
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={link}>
              Home
            </NavLink>
            <NavLink to="/sheet" className={link}>
              DSA sheet
            </NavLink>
            <NavLink to="/progress" className={link}>
              Progress
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">{user?.displayName}</span>
          <button className="text-muted hover:text-ink" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
