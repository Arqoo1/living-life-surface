import React, { useState, useEffect } from "react";
import { verifyAndResetPassword, requestPasswordReset } from "../api/user";

interface Props {
  email: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const ResetPasswordModal: React.FC<Props> = ({ email, onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0); 

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setTimer(60); 
    } catch (err: any) {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyAndResetPassword({ email, code, newPassword });
      onSuccess("Password changed successfully!");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid code or request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Verify Reset Code</h3>
        <p>
          Sent to: <strong>{email}</strong>
        </p>

        {error && (
          <div
            className="error-banner"
            style={{ color: "red", marginBottom: "10px" }}
          >
            {error}
          </div>
        )}
        {timer > 0 && (
          <div style={{ color: "green", fontSize: "12px" }}>
            New code sent! Wait {timer}s to resend.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>6-Digit Code</label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div
            className="resend-container"
            style={{ textAlign: "right", marginBottom: "15px" }}
          >
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || timer > 0}
              style={{
                background: "none",
                border: "none",
                color: timer > 0 ? "#ccc" : "#3b82f6",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {resending
                ? "Resending..."
                : timer > 0
                ? `Resend in ${timer}s`
                : "Didn't get a code? Resend"}
            </button>
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Verifying..." : "Update Password"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
