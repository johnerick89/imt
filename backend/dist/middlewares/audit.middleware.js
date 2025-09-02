"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = void 0;
const prisma_middleware_1 = require("./prisma.middleware");
const auditMiddleware = (req, res, next) => {
    const requestId = (0, prisma_middleware_1.generateRequestId)();
    const ipAddress = req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        "unknown";
    const context = {
        userId: req.user?.id || "anonymous",
        organizationId: req.user?.organisation_id,
        ipAddress,
        requestId,
        userAgent: req.get("User-Agent"),
        metadata: {
            method: req.method,
            url: req.url,
            userEmail: req.user?.email,
            userRole: req.user?.role,
        },
    };
    (0, prisma_middleware_1.setPrismaContext)(requestId, context);
    res.setHeader("X-Request-ID", requestId);
    res.on("finish", () => {
        (0, prisma_middleware_1.clearPrismaContext)(requestId);
    });
    next();
};
exports.auditMiddleware = auditMiddleware;
//# sourceMappingURL=audit.middleware.js.map