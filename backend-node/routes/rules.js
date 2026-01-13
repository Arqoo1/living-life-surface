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

// 1. CHANGE THIS TO POST: To accept the 'state' body from frontend
router.post("/evaluate", getRules);
// 2. KEEP AS POST: This already accepts a body
router.post("/", createRule); 

// 3. CHANGE TO PATCH/POST: Ensure these can receive { content, state }
router.patch("/:id", updateRule); 

// 4. IMPORTANT: Standard DELETE doesn't always support bodies. 
// If you need to send 'state' during a delete, use POST or update the controller.
router.delete("/:id", deleteRule); 

export default router;