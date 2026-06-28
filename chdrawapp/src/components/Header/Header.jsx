import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({
  onLoadClick,
  onSaveClick,
  title,
  onTitleCommit,
  isPublic,
  onVisibilityToggle,
}) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const titleEditable = !!localStorage.getItem("whiteboardCode");
  const [titleDraft, setTitleDraft] = useState(title ?? "");

  useEffect(() => {
    setTitleDraft(title ?? "");
  }, [title]);

  const commitTitle = () => {
    if (titleDraft === title) return;
    onTitleCommit?.(titleDraft);
  };

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
        <input
          type="text"
          className="header-title"
          value={titleEditable ? titleDraft : (title ?? "")}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setTitleDraft(title ?? "");
            }
          }}
          readOnly={!titleEditable}
          disabled={!titleEditable}
          title={
            titleEditable ? title : "Save or load a whiteboard to edit its title"
          }
          aria-label="Current whiteboard title"
        />
        {token && titleEditable && (
          <label className="header-public">
            <input
              type="checkbox"
              checked={!!isPublic}
              onChange={(e) => onVisibilityToggle?.(e.target.checked)}
            />
            Make Public
          </label>
        )}
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
