// routes/adminAgentRoutes.js
import express from "express";
import {
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  approveAgent,
  rejectAgent,
} from "../controllers/manageAgentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js"; // protect + admin role middleware

const router = express.Router();

// 🔹 View all agents
router.get("/", protect, isAdmin, getAllAgents);

// 🔹 View agent by ID
router.get("/:id", protect, isAdmin, getAgentById);

// 🔹 Update agent
router.put("/:id", protect, isAdmin, updateAgent);

// 🔹 Delete agent
router.delete("/:id", protect, isAdmin, deleteAgent);

// 🔹 Approve agent
router.put("/approve/:id", protect, isAdmin, approveAgent);

// 🔹 Reject agent
router.put("/reject/:id", protect, isAdmin, rejectAgent);

export default router;
