import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(email, password);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        navigate("/dashboard");
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Life Stream</h2>

        {error && <p className="error-msg">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        <footer>
          Don't have an account? <a href="/signup">Create one</a>
        </footer>
      </form>
    </div>
  );
};

export default Login;
