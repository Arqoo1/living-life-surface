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

  return (
    <header
      style={{
        padding: "1rem",
        backgroundColor: "#2E186A",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link
          to="/"
          style={{
            color: "#fff",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "1.2rem",
          }}
        >
          Life Dashboard
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(0,0,0,0.2)",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.75rem",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isOnline ? "#4ade80" : "#9ca3af",
              boxShadow: isOnline ? "0 0 8px #4ade80" : "none",
              transition: "all 0.3s ease",
            }}
          />
          <span style={{ opacity: 0.8, color: "#fff" }}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link to="/profile" style={{ color: "#fff", textDecoration: "none" }}>
          Profile
        </Link>
        {!token && (
          <>
            <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
              Login
            </Link>
            <Link
              to="/signup"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              Register
            </Link>
          </>
        )}
      </nav>

      <div>
        {token && (
          <button
            onClick={handleLogout}
            style={{
              background: "#e190e3",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              color: "#1b1b1b",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
