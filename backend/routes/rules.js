import express from "express";
import {
  createRule,
  getRules,
  updateRule,
  deleteRule
} from "../controllers/ruleController.js";
import { authMiddleware } from "../controllers/authController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createRule);
router.get("/", getRules);      
router.patch("/:id", updateRule);
router.delete("/:id", deleteRule);

export default router;