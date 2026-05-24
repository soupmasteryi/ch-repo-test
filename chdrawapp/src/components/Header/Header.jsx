import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header-home">Home</a>
      <button type="button" className="header-login" onClick={() => {}}>
        Login
      </button>
    </header>
  );
}
