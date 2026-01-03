import express from "express";
import {
  createMoment,
  getMoments,
  updateMoment,
  deleteMoment,
} from "../controllers/momentController.js";
import { authMiddleware } from "../controllers/authController.js"; 

const router = express.Router();

router.use(authMiddleware);

router.post("/", createMoment);
router.get("/", getMoments);
router.patch("/:id", updateMoment);
router.delete("/:id", deleteMoment);

export default router;
