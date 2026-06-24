import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { register } from "../../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleEmailBlur = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(re.test(email));
  };

  const handleConfirmBlur = () => {
    setPasswordsMatch(confirmPassword === password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordsOk = confirmPassword === password;
    setEmailValid(emailOk);
    setPasswordsMatch(passwordsOk);
    setError("");
    if (!emailOk || !passwordsOk) return;

    setSubmitting(true);
    try {
      const { accessToken, user } = await register({ email, password });
      localStorage.setItem("token", accessToken);
      if (user?.id) localStorage.setItem("userId", user.id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1 className="register-title">Register</h1>
        <label className="register-label">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            className="register-input"
          />
          {emailValid !== null && (
            <span
              className={
                emailValid ? "register-msg-ok" : "register-msg-err"
              }
            >
              {emailValid ? "Email valid" : "Email invalid"}
            </span>
          )}
        </label>
        <label className="register-label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
          />
        </label>
        <label className="register-label">
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={handleConfirmBlur}
            className="register-input"
          />
          {passwordsMatch !== null && (
            <span
              className={
                passwordsMatch ? "register-msg-ok" : "register-msg-err"
              }
            >
              {passwordsMatch ? "Passwords match" : "Passwords don't match"}
            </span>
          )}
        </label>
        {error && <span className="register-msg-err">{error}</span>}
        <button type="submit" className="register-button" disabled={submitting}>
          {submitting ? "Registering…" : "Register"}
        </button>
        <p className="register-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
