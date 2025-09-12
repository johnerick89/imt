import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const appUrl = process.env.APP_URL?.trim(); // Safe access, trim any spaces

const allowedOrigins = [
  // Dynamic from env (production or custom local)
  ...(appUrl ? [appUrl] : []),

  // Local dev fallbacks (keep these for flexibility)
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",

  // Regex for any local port (covers Vite variations)
  /^http:\/\/localhost:[0-9]{4}$/,
  /^http:\/\/127\.0\.0\.1:[0-9]{4}$/,
];

const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    console.log(`CORS Debug: ${origin} - Origin: ${origin}`);
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string"
        ? allowed === origin
        : (allowed as RegExp).test(origin)
    );
    if (isAllowed) {
      console.log(`CORS: Origin ${origin} allowed`);
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-API-Key",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

// Middleware (order matters)
app.use(cors(corsConfig));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  return next();
});
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
    skip: (req) => req.method === "OPTIONS",
  })
);
app.use(morgan("combined"));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    if (req.method === "OPTIONS" || req.headers.origin) {
      console.log(
        `CORS Debug: ${req.method} ${req.url} - Origin: ${req.headers.origin}`
      );
    }
    next();
  });
}

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});
app.use("/", routes);
app.use("*", notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
});

export default app;
