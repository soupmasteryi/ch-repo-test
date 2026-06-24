import { useEffect, useState } from "react";
import "./Login.css";
import { login } from "../../api/auth";

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, go straight to the home page.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigateTo("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const { accessToken, user } = await login({ email, password });
      localStorage.setItem("token", accessToken);
      if (user?.id) localStorage.setItem("userId", user.id);
      navigateTo("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Login</h1>
        <label className="login-label">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
        </label>
        <label className="login-label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
        </label>
        {error && <span className="login-error">{error}</span>}
        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? "Logging in…" : "Login"}
        </button>
        <p className="login-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}
