import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const location = useLocation();


  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
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
      <div>
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
      </div>

      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
          Dashboard
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