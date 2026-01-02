import express from "express";
import {
  createTrack,
  getTracks,
  updateTrack,
  deleteTrack,
} from "../controllers/trackController.js";
import { authMiddleware } from "../controllers/authController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTrack);
router.get("/", getTracks);    
router.patch("/:id", updateTrack);
router.delete("/:id", deleteTrack);

export default router;