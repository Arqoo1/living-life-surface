import api from "./axios";

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePic?: string; // Optional because new users might not have one yet
  // Added XP and Level to match backend models
  xp: number;
  level: number;
}

export interface ProfileUpdateResponse {
  message: string;
  user: UserProfile;
}

export interface ProfilePicResponse {
  message: string;
  profilePic: string; // Returns the new filename from the server
}

// --- API Functions ---

export const fetchProfile = async () => {
  // Returns the full UserProfile including XP and Level
  return await api.get<UserProfile>("/auth/profile");
};

export const updateProfile = async (updatedData: Partial<UserProfile>) => {
  return await api.patch<ProfileUpdateResponse>("/auth/profile", updatedData);
};

export const uploadProfilePic = async (formData: FormData) => {
  return await api.post<ProfilePicResponse>("/auth/upload", formData, {
    headers: {
      // This tells the server to expect a file (multipart)
      "Content-Type": "multipart/form-data",
    },
  });
};

export const requestPasswordReset = async (email: string) => {
  return await api.post("/auth/forgot-password", { email });
};

export const verifyAndResetPassword = async (resetData: {
  email: string;
  code: string;
  newPassword: string;
}) => {
  return await api.post("/auth/reset-password", resetData); // Verifies and updates
};
