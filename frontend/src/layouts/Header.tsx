import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "../db";

const Header: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    await db.delete();
    await db.open();
    setToken(null);
    window.location.href = "/login";
  };

  const navClass = (path: string) =>
    `nav-link ${location.pathname === path ? "nav-link--active" : ""}`;

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="logo">
          LIFE<span>.</span>
        </Link>

        <div className="header__status">
          <div className={`indicator ${isOnline ? "indicator--online" : ""}`} />
          <span className="label">{isOnline ? "System Live" : "Offline"}</span>
        </div>
      </div>

      <nav className="header__nav">
        <Link to="/" className={navClass("/")}>
          Home
        </Link>
        <Link to="/dashboard" className={navClass("/dashboard")}>
          Dashboard
        </Link>
        <Link to="/profile" className={navClass("/profile")}>
          Profile
        </Link>

        {!token && (
          <>
            <div className="divider" />
            <Link to="/login" className={navClass("/login")}>
              Login
            </Link>
            <Link to="/signup" className={navClass("/signup")}>
              Register
            </Link>
          </>
        )}
      </nav>

      <div className="header__actions">
        {token && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
