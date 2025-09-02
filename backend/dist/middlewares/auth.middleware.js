"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_utils_1 = require("../api/auth/auth.utils");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const path = req.path;
        const isPublicPath = path.startsWith("/api/v1/auth") || path.startsWith("/health");
        if (isPublicPath) {
            next();
            return;
        }
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = (0, auth_utils_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid token.",
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map