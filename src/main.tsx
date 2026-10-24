import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { BrowserRouter, Route, Routes } from "react-router";
import { NCatsGame } from './games/ncats/NCatsGame.tsx';
import Header from './components/Header.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ncatsgame" element={<NCatsGame />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
