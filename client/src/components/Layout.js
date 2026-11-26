import { useEffect, useState } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_KEY = "pharmacy_sidebar_collapsed";

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "◫" },
  { to: "/categories", label: "Categories", icon: "▤" },
  { to: "/inventory", label: "Inventory", icon: "▦" },
  { to: "/ai-bill", label: "AI Bill Upload", icon: "◎" },
  { to: "/purchase-orders", label: "Purchase Orders", icon: "☰" },
  { to: "/alerts", label: "Alerts", icon: "⚑" },
  { to: "/supplier-returns", label: "Supplier Returns", icon: "↩" },
];

const sharedLinks = [
  { to: "/pos", label: "POS Billing", icon: "₵" },
  { to: "/customer-returns", label: "Customer Returns", icon: "↺" },
  { to: "/stock-lookup", label: "Stock Lookup", icon: "⌕" },
];

function NavGroup({ links, collapsed }) {
  return (
    <nav className="nav-block">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className="nav-link"
          title={collapsed ? l.label : undefined}
        >
          <span className="nav-icon" aria-hidden>
            {l.icon}
          </span>
          {!collapsed && <span className="nav-label">{l.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export function Layout() {
  const { user, logout, isAdmin, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  function toggleSidebar() {
    setCollapsed((c) => !c);
  }

  if (loading) {
    return (
      <div className="center-page">
        <div className="loader" aria-hidden />
        <p className="muted">Loading workspace…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const shellClass = `app-shell${collapsed ? " sidebar-collapsed" : ""}`;
  const sidebarClass = `sidebar${collapsed ? " is-collapsed" : ""}`;

  return (
    <div className={shellClass}>
      <aside className={sidebarClass}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-icon" aria-hidden>
              Rx
            </span>
            {!collapsed && (
              <div className="brand-text">
                <strong className="brand-title">Smart Pharmacy</strong>
                <p className="brand-sub">Inventory · POS · AI</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {isAdmin && !collapsed && <p className="nav-section-label">Back office</p>}
        {isAdmin && <NavGroup links={adminLinks} collapsed={collapsed} />}

        {!collapsed && <p className="nav-section-label">Counter</p>}
        <NavGroup links={sharedLinks} collapsed={collapsed} />

        <div className="sidebar-foot">
          <div className="user-chip" title={collapsed ? user.name : undefined}>
            <span className="user-avatar" aria-hidden>
              {user.name.charAt(0)}
            </span>
            {!collapsed && (
              <div>
                <div className="user-name">{user.name}</div>
                <span className={`role-pill role-${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn ghost light"
            onClick={logout}
            title={collapsed ? "Sign out" : undefined}
          >
            {collapsed ? "⎋" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="main">
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
