import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import hero from "../assets/hero.png";

export function LoginPage() {
  const { login, user, loading, isAdmin } = useAuth();
  const [email, setEmail] = useState("admin@pharmacy.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to={isAdmin ? "/dashboard" : "/pos"} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <img src={hero} alt="" className="login-hero-img" />
        <div className="login-hero-overlay">
          <h1 className="login-hero-title">Care at the counter.</h1>
          <p className="login-hero-text">
            Batch-aware inventory, FEFO billing, and AI supplier reconciliation in one
            place.
          </p>
          <ul className="login-features">
            <li>FEFO POS & printable receipts</li>
            <li>PO auto-reconciliation from bills</li>
            <li>Expiry & low-stock alerts</li>
          </ul>
        </div>
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-card-inner">
          <span className="eyebrow">Smart Pharmacy ERP</span>
          <h2>Welcome back</h2>
          <p className="muted">Sign in with your pharmacy role</p>

          {error && (
            <p className="toast toast-error" role="alert">
              {error}
            </p>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pharmacy.local"
              required
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="btn primary block" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="demo-creds">
            <p className="muted">Demo accounts</p>
            <code>admin@pharmacy.local</code> / <code>admin123</code>
            <br />
            <code>cashier@pharmacy.local</code> / <code>cashier123</code>
          </div>
        </div>
      </form>
    </div>
  );
}
