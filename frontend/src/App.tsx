import { useState, useEffect } from "react";
import { useContent } from "./hooks/useContent";
import Home from "./pages/Home";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Wizard1Step1 from "./pages/Wizard1Step1";
import Wizard1Step2 from "./pages/Wizard1Step2";
import Wizard1Step3 from "./pages/Wizard1Step3";
import Wizard2Step1 from "./pages/Wizard2Step1";
import Wizard2Step2 from "./pages/Wizard2Step2";
import Wizard2Step3 from "./pages/Wizard2Step3";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname;
    return path.startsWith("/admin") ? "admin" : path === "/" ? "home" : path;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const content = useContent();

  useEffect(() => {
    // Update current page on URL change
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPage(path);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPage(path);
    setMenuOpen(false);
  };

  const renderPage = () => {
    if (currentPage.startsWith("/admin")) {
      return <Admin />;
    } else if (currentPage === "/faq") {
      return <FAQ />;
    } else if (currentPage === "/about") {
      return <About />;
    } else if (currentPage === "/wizard/secure-access/step-1") {
      return <Wizard1Step1 />;
    } else if (currentPage === "/wizard/secure-access/step-2") {
      return <Wizard1Step2 />;
    } else if (currentPage === "/wizard/secure-access/step-3") {
      return <Wizard1Step3 />;
    } else if (currentPage === "/wizard/data-import/step-1") {
      return <Wizard2Step1 />;
    } else if (currentPage === "/wizard/data-import/step-2") {
      return <Wizard2Step2 />;
    } else if (currentPage === "/wizard/data-import/step-3") {
      return <Wizard2Step3 />;
    } else {
      return <Home />;
    }
  };

  return (
    <div className="app">
      {content.mode === "draft" && (
        <div className="draft-banner">
          🚀 <strong>DRAFT MODE</strong> - Viewing unpublished content
          <button onClick={() => content.setMode("published")}>Switch to Published</button>
        </div>
      )}

      <header className="header">
        <nav className="nav">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="nav-brand">
            <strong>Micro CMS</strong>
          </a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? "✕" : "☰"}
          </button>
          {content.mode === "published" && (
            <button className="draft-toggle" onClick={() => content.setMode("draft")}>
              📝 Draft
            </button>
          )}
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
              Home
            </a>
            <a href="/faq" onClick={(e) => { e.preventDefault(); navigate("/faq"); }}>
              FAQ
            </a>
            <a href="/about" onClick={(e) => { e.preventDefault(); navigate("/about"); }}>
              About
            </a>
            <a href="/admin" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>
              Admin
            </a>
          </div>
        </nav>
      </header>

      <main className="main">{renderPage()}</main>

      <footer className="footer">
        <p>&copy; 2026 Micro CMS. Database-backed content for everyone.</p>
      </footer>
    </div>
  );
}
