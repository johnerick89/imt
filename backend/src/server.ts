import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
const allowedOrigins = [
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
  /^http:\/\/localhost:[0-9]{4}$/,
  /^http:\/\/127\.0\.0\.1:[0-9]{4}$/,
  // Add production domains here, e.g., "https://your-production-domain.com"
];

// CORS configuration
const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow non-browser clients (e.g., Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Check if origin matches allowedOrigins or regex
    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string" ? allowed === origin : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed`);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
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
  preflightContinue: false,
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware
app.use(cors(corsConfig));

// Additional CORS handling for edge cases
app.use((req, res, next) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");
    res.status(200).end();
    return;
  }

  // Add CORS headers to all responses
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Explicit OPTIONS handler for all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");
  res.status(200).end();
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP if causing issues; customize if needed
  })
);
// Cookie parsing
app.use(cookieParser());

// Body parsing middleware (consolidated, with limits)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting (applied globally for better protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  // Skip rate limiting for OPTIONS requests
  skip: (req) => req.method === "OPTIONS",
  // Skip rate limiting for health checks
  skipSuccessfulRequests: false,
});

app.use(limiter);

// Logging middleware
app.use(morgan("combined"));

// CORS debugging middleware (only in development)
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/", routes);

// 404 handler
app.use("*", notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
});

export default app;
