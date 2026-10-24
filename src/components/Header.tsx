import { Link } from 'react-router';

export default function Header() {
  return (
    <header className="app-header">
      <Link to="" className="app-logo">
        Purrzzles
      </Link>

      <nav>
        <Link to="ncatsgame">N-Cats</Link>
      </nav>
    </header>
  );
}
