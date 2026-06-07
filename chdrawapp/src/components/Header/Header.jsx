import "./Header.css";

export default function Header({ onLoadClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <a href="/" className="header-home">Home</a>
        <button type="button" className="header-load" onClick={onLoadClick}>
          load
        </button>
      </div>
      <button type="button" className="header-login" onClick={() => {}}>
        Login
      </button>
    </header>
  );
}
