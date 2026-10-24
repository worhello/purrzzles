import { Link } from 'react-router';

import '../styles/App.css'

function App() {

  return (
    <>
      <section id="center">
        <div>
          <h1>Get started</h1>
          <p>
            <Link to="/ncatsgame">Play N-Cats Game</Link>
          </p>
        </div>
      </section>
    </>
  )
}

export default App
