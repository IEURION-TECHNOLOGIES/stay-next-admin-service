import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import Routes from "./routes/manageAgentRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// ===== Dynamic CORS Setup =====
const allowedOrigins = process.env.CLIENT_URL?.split(",").map(o => o.trim()) || [];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "admin-service" });
});

// ===== API Routes =====
app.use("/api/admin/agents", Routes);

export default app;
