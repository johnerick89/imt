import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { closePeriodicOrgBalancesJob } from "./jobs/closeperiodicorgbalances.jobs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins (stable, no regex for now)
const allowedOrigins = [
  process.env.APP_URL?.trim(),
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

// ✅ Final CORS config
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow curl/Postman
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked origin: ", origin);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"], // minimal set
  })
);

// const corsConfig = {
//   credentials: true,
//   origin: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
// };

// app.use(cors(corsConfig));

// Security + utilities
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    skip: (req) => req.method === "OPTIONS", // skip preflight
  })
);
app.use(morgan("combined"));

// Debug helper (see CORS headers in response)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    res.setHeader("X-Debug-Origin", req.headers.origin || "none");
    next();
  });
}

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/", routes);

// Error handling
app.use("*", notFoundHandler);
app.use(errorHandler);

// Initialize scheduled jobs
closePeriodicOrgBalancesJob.initializeJob();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
