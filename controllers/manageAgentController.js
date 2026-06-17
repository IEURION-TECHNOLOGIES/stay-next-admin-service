import AgentProfile from "../models/agentProfile.js";
import axios from "axios";
import { sendEmail } from "../utils/sendEmail.js";
import { emailTemplate } from "../utils/emailTemplates.js";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3000";

console.log("Auth Service URL:", AUTH_SERVICE_URL);

/**
 * Get all agents
 */
export const getAllAgents = async (req, res) => {
  try {
    const agents = await AgentProfile.find();
    // Fetch linked user info from Auth Service
    const agentsWithUser = await Promise.all(
      agents.map(async (agent) => {
        try {
          const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}`);
          return { ...agent.toObject(), user: data.user };
        } catch (err) {
          console.warn("User info fetch failed for", agent.userId);
          return { ...agent.toObject(), user: {} };
        }
      })
    );

    res.status(200).json({ agents: agentsWithUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch agents." });
  }
};

/**
 * Get single agent
 */
export const getAgentById = async (req, res) => {
  try {
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    let user = {};
    try {
      const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}`);
      user = data.user;
    } catch (err) {
      console.warn("User info fetch failed for", agent.userId);
    }

    res.status(200).json({ agent: { ...agent.toObject(), user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch agent." });
  }
};

/**
 * Update agent details
 */
export const updateAgent = async (req, res) => {
  try {
    const { status, reviewMessage, otherDetails } = req.body;
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    if (status) agent.status = status;
    if (reviewMessage) agent.reviewMessage = reviewMessage;
    if (otherDetails) Object.assign(agent, otherDetails);

    agent.reviewedAt = new Date();
    await agent.save();

    res.status(200).json({ message: "Agent updated successfully.", agent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update agent." });
  }
};

/**
 * Approve agent
 */
export const approveAgent = async (req, res) => {
  try {
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    agent.status = "approved";
    agent.reviewedAt = new Date();
    agent.reviewMessage = req.body.message || "Your verification has been approved.";
    await agent.save();

    // Update user role in auth service
    try {
      await axios.put(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}/role`, {
        role: "agent",
        isVerified: true,
      });
    } catch (err) {
      console.warn("Failed to update user role:", agent.userId);
    }

    // Send approval email
    try {
      const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}`);
      const user = data.user;

      await sendEmail({
        to: user.email,
        subject: "Your Agent Account Has Been Approved",
        html: emailTemplate("agentApproved", user, {
          loginLink: process.env.CLIENT_URL + "/login",
        }),
      });
    } catch (err) {
      console.warn("Failed to send approval email:", agent.userId);
    }

    res.status(200).json({ message: "Agent approved successfully.", agent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve agent." });
  }
};

/**
 * Reject agent
 */
export const rejectAgent = async (req, res) => {
  try {
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    agent.status = "rejected";
    agent.reviewedAt = new Date();
    agent.reviewMessage = req.body.message || "Your verification has been rejected.";
    await agent.save();

    // Send rejection email
    try {
      const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}`);
      const user = data.user;

      await sendEmail({
        to: user.email,
        subject: "Agent Verification Rejected",
        html: emailTemplate("agentDeleted", user, {
          reason: agent.reviewMessage,
          supportLink: process.env.CLIENT_URL + "/support",
        }),
      });
    } catch (err) {
      console.warn("Failed to send rejection email:", agent.userId);
    }

    res.status(200).json({ message: "Agent rejected successfully.", agent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject agent." });
  }
};

/**
 * Delete agent
 */
export const deleteAgent = async (req, res) => {
  try {
    const { reason } = req.body;
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    // Fetch user info before deletion
    let user = {};
    try {
      const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}`);
      user = data.user;
    } catch {
      console.warn("Could not fetch user before deletion:", agent.userId);
    }

    // Delete user in auth service
    try {
      await axios.delete(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}`);
    } catch (err) {
      console.warn("Failed to delete linked user:", agent.userId);
    }

    // Delete agent profile
    await agent.remove();

    // Send account deletion email
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Your Agent Account Has Been Deleted",
          html: emailTemplate("agentDeleted", user, {
            reason: reason || "Violation of company policy or terms of use.",
            supportLink: process.env.CLIENT_URL + "/support",
          }),
        });
      } catch (err) {
        console.warn("Failed to send deletion email:", user.email);
      }
    }

    res.status(200).json({ message: "Agent deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete agent." });
  }
};


/**
 * Suspend agent
 */
export const suspendAgent = async (req, res) => {
  try {
    const { reason } = req.body;
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    // Update user in auth service
    await axios.put(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}/role`, {
      isSuspended: true,
      suspensionReason: reason || "Suspended by admin.",
    });

    res.status(200).json({ message: "Agent suspended successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to suspend agent." });
  }
};

/**
 * Unsuspend agent
 */
export const unsuspendAgent = async (req, res) => {
  try {
    const agent = await AgentProfile.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found." });

    // Update user in auth service
    await axios.put(`${AUTH_SERVICE_URL}/api/auth/internal/users/${agent.userId}/role`, {
      isSuspended: false,
      suspensionReason: "",
    });

    res.status(200).json({ message: "Agent unsuspended successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unsuspend agent." });
  }
};
