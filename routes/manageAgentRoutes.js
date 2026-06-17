import express from "express";
import {
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  approveAgent,
  rejectAgent,
  suspendAgent,
  unsuspendAgent,
} from "../controllers/manageAgentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 All agents
router.get("/", protect, isAdmin, getAllAgents);

// 🔹 Specific actions FIRST — before /:id
router.put("/approve/:id", protect, isAdmin, approveAgent);
router.put("/reject/:id", protect, isAdmin, rejectAgent);
router.put("/suspend/:id", protect, isAdmin, suspendAgent);
router.put("/unsuspend/:id", protect, isAdmin, unsuspendAgent);

// 🔹 Generic /:id routes LAST
router.get("/:id", protect, isAdmin, getAgentById);
router.put("/:id", protect, isAdmin, updateAgent);
router.delete("/:id", protect, isAdmin, deleteAgent);

export default router;
