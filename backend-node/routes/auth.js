import express from "express";
import multer from "multer";
import path from "path";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  uploadProfilePic,
  forgotPassword, 
  resetPassword,
  authMiddleware,
} from "../controllers/authController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
  fileFilter: (req, file, cb) => {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|webp/;
    // Check the extension name
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check the actual file type (mimetype)
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (.jpeg, .jpg, .png, .webp) are allowed!"));
    }
  },
});

// Public routes
router.post("/signup", signup);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);

router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    // Wrap the multer upload in a custom function to catch errors
    upload.single("profilePic")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large! Max is 2MB." });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadProfilePic
);

export default router;
