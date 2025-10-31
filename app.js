import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import Routes from './routes/manageAgentRoutes.js';

const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Allow frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// ===== API Route =====
app.use("/api/admin/agents", Routes);

// ===== Serve frontend =====
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// ===== React Router fallback =====
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  } else {
    next();
  }
});

export default app;
