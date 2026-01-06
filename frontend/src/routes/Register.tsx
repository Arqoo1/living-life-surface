import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await register(username, email, password);
      if (res.message && !res.error) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(res.error || "Signup failed");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        {success && (
          <p className="message success">Account created! Redirecting...</p>
        )}
        {error && <p className="message error">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={success}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={success}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={success}
        />

        <button
          type="submit"
          disabled={loading || success}
          className={`submit-btn ${success ? "success-state" : ""}`}
        >
          {loading ? "Signing up..." : success ? "Success!" : "Sign Up"}
        </button>

        <p className="footer-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
