import React, { useState, useEffect } from "react";

const Footer: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="footer">
      <div className="footer__container">
        
        <div className="footer__brand">
          <span className="title">LIFE DASHBOARD</span>
          <span className="subtitle">
            Designed & Developed by <span className="author">Giorgi Arkania</span>
          </span>
        </div>

        <div className="footer__divider" />

        <div className="footer__clock">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        <div className="footer__meta">
          <span className="dim">&copy; {new Date().getFullYear()}</span>
          <span className="dim">•</span>
          
          <span className="engine-status">
            <span className="dot">●</span> UI Engine Active
          </span>

          <span className="dim">•</span>
          <span className="dim">v2.0.4</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;