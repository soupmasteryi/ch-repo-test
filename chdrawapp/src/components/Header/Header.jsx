import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ onLoadClick, onSaveClick }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    navigate("/logout");
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-home">Home</Link>
        <button type="button" className="header-load" onClick={onLoadClick}>
          load
        </button>
        <button
          type="button"
          className="header-load"
          onClick={onSaveClick}
          disabled={!token}
          title={token ? undefined : "Log in to save"}
        >
          save
        </button>
      </div>
      {token ? (
        <div className="header-account" ref={accountRef}>
          <button
            type="button"
            className="header-login"
            onClick={() => setMenuOpen((o) => !o)}
          >
            Account
          </button>
          {menuOpen && (
            <div className="header-menu" role="menu">
              <button
                type="button"
                className="header-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard");
                }}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="header-menu-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="header-login"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      )}
    </header>
  );
}
