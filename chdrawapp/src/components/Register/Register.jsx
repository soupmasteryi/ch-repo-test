import { useState } from "react";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(null);

  const handleEmailBlur = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(re.test(email));
  };

  const handleConfirmBlur = () => {
    setPasswordsMatch(confirmPassword === password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        <button type="submit" className="register-button">
          Register
        </button>
        <p className="register-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
