import React, { useEffect, useState, useRef } from "react";
import { db } from "../db"; 
import {
  fetchProfile,
  updateProfile,
  uploadProfilePic,
  requestPasswordReset,
  type UserProfile,
} from "../api/user";
import ResetPasswordModal from "../components/ResetPasswordModal";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initProfile = async () => {
      try {
        const cached = await db.profile.get("current");
        if (cached) {
          setUser(cached as any);
          setEditData({ username: cached.username, email: cached.email });
          setLoading(false); 
        }

        const { data } = await fetchProfile();

        setUser(data);
        setEditData({ username: data.username, email: data.email });
        await db.profile.put({ id: "current", ...data });
      } catch (err: any) {
        console.error("Profile sync error:", err);
        const stillNoUser = await db.profile.count();
        if (stillNoUser === 0) setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setError("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const updateLocalAndState = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    await db.profile.put({ id: "current", ...updatedUser });
  };

  const handleSave = async () => {
    try {
      const { data } = await updateProfile(editData);
      await updateLocalAndState(data.user);
      setIsEditing(false);
      triggerSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Update failed.");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const { data } = await updateProfile({
        ...editData,
        profilePic: "default-guest.png",
      });
      await updateLocalAndState(data.user);
      triggerSuccess("Photo removed.");
    } catch (err: any) {
      setError("Failed to remove photo.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        setError("File is too large! Max size is 2MB.");
        return;
      }

      const formData = new FormData();
      formData.append("profilePic", file);

      try {
        const { data } = await uploadProfilePic(formData);
        if (user) {
          const updatedUser = { ...user, profilePic: data.profilePic };
          await updateLocalAndState(updatedUser);
        }
        triggerSuccess("Photo uploaded successfully!");
      } catch (err: any) {
        const serverMessage =
          err.response?.data?.error || "Image upload failed.";
        setError(serverMessage);
      }
    }
  };

  const handleStartReset = async () => {
    if (!user?.email) {
      setError("User email not found.");
      return;
    }

    setSendingEmail(true);
    setError("");
    try {
      await requestPasswordReset(user.email);
      setIsResetModalOpen(true);
      triggerSuccess("Reset code sent to your email!");
    } catch (err: any) {
      const serverError =
        err.response?.data?.error || "Could not send reset email.";
      setError(serverError);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  const imageUrl = user?.profilePic
    ? `http://localhost:5000/uploads/${user.profilePic}?t=${Date.now()}`
    : `http://localhost:5000/uploads/default-guest.png`;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        <div className="avatar-wrapper" style={{ position: "relative" }}>
          <div
            className="avatar-circle"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={imageUrl}
              alt="Profile"
              className={`avatar-img ${
                user?.profilePic?.includes("guest") ? "pixelated" : ""
              }`}
            />
            <div className="avatar-overlay">Change</div>
          </div>

          {user?.profilePic && user.profilePic !== "default-guest.png" && (
            <button
              onClick={handleRemovePhoto}
              className="remove-photo-btn"
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "none",
                border: "none",
                color: "#ef4444",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Remove Photo
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>

        <h2 className="profile-title">{user?.username}</h2>
        <p className="profile-subtitle">{user?.email}</p>
        <hr className="divider" />

        {error && <div className="error-banner">{error}</div>}

        {!isEditing ? (
          <div className="view-section">
            <div className="info-group">
              <span className="label">Username</span>
              <span className="value">{user?.username}</span>
            </div>
            <div className="info-group">
              <span className="label">Email Address</span>
              <span className="value">{user?.email}</span>
            </div>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="edit-section">
            <div className="input-group">
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
            </div>
            <div className="button-group">
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <hr className="divider" />
        <div
          className="security-section"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <h3
            style={{ fontSize: "16px", marginBottom: "10px", color: "#374151" }}
          >
            Security
          </h3>
          <button
            className="edit-btn"
            style={{ backgroundColor: "#4b5563", width: "100%" }}
            onClick={handleStartReset}
            disabled={sendingEmail}
          >
            {sendingEmail ? "Sending Email..." : "Change Password"}
          </button>
        </div>
      </div>

      {isResetModalOpen && user && (
        <ResetPasswordModal
          email={user.email}
          onClose={() => setIsResetModalOpen(false)}
          onSuccess={(msg) => triggerSuccess(msg)}
        />
      )}
    </div>
  );
};

export default Profile;
