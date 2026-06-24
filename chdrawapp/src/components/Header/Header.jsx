import { useEffect, useRef, useState } from "react";
import "./Header.css";
import { logout } from "../../api/auth";

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Header({ onLoadClick, onSaveClick }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
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

  const handleLogout = async () => {
    setMenuOpen(false);
    const current = localStorage.getItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("canvasLoadData");
    localStorage.removeItem("whiteboardCode");
    setToken(null);
    if (current) await logout(current);
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-left">
        <a href="/" className="header-home">Home</a>
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
                onClick={() => setMenuOpen(false)}
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
          onClick={() => navigateTo("/login")}
        >
          Login
        </button>
      )}
    </header>
  );
}
