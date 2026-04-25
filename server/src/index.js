import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { AuditDecision } from "./models/AuditDecision.js";
import { scoreApplication } from "./services/scoring.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const memoryAuditLog = [];

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    console.log("MongoDB disabled: MONGODB_URI is not set.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log("MongoDB connected.");
  } catch (error) {
    console.log("MongoDB unavailable, using in-memory audit log.");
  }
}

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "credit-risk-scoring-api",
    mongo: isMongoReady() ? "connected" : "memory-fallback"
  });
});

app.get("/", (req, res) => {
  const clientUrl = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.type("html").send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Credit Risk API</title>
        <style>
          body {
            align-items: center;
            background: #f5f7f8;
            color: #17202a;
            display: grid;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            min-height: 100vh;
            margin: 0;
            place-items: center;
          }
          main {
            background: white;
            border: 1px solid #dfe7ea;
            border-radius: 8px;
            box-shadow: 0 18px 50px rgba(29, 45, 57, 0.08);
            max-width: 520px;
            padding: 28px;
          }
          a {
            color: #0b6b61;
            font-weight: 800;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Credit Risk API is running</h1>
          <p>The React app runs on <a href="${clientUrl}">${clientUrl}</a>.</p>
          <p>API health endpoint: <a href="/api/health">/api/health</a></p>
        </main>
      </body>
    </html>
  `);
});

app.post("/api/score", async (req, res, next) => {
  try {
    const result = scoreApplication(req.body);
    const record = {
      applicantName: req.body.applicantName || "Unnamed applicant",
      application: result.application,
      result
    };

    let saved;
    if (isMongoReady()) {
      saved = await AuditDecision.create(record);
    } else {
      saved = { _id: `MEM-${Date.now()}`, createdAt: new Date(), ...record };
      memoryAuditLog.unshift(saved);
      memoryAuditLog.splice(25);
    }

    res.status(201).json({
      auditId: saved._id,
      createdAt: saved.createdAt,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/audits", async (req, res, next) => {
  try {
    if (isMongoReady()) {
      const records = await AuditDecision.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      res.json(records);
      return;
    }

    res.json(memoryAuditLog);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Unexpected server error"
  });
});

await connectMongo();

app.listen(port, () => {
  console.log(`Credit risk API listening on http://localhost:${port}`);
});
