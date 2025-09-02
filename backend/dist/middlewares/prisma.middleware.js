"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestId = exports.clearPrismaContext = exports.setPrismaContext = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const contextStore = {};
const setPrismaContext = (requestId, context) => {
    contextStore[requestId] = context;
};
exports.setPrismaContext = setPrismaContext;
const clearPrismaContext = (requestId) => {
    delete contextStore[requestId];
};
exports.clearPrismaContext = clearPrismaContext;
const generateRequestId = () => (0, uuid_1.v4)();
exports.generateRequestId = generateRequestId;
const prisma = new client_1.PrismaClient().$extends({
    query: {
        async $allOperations({ operation, args, query, model }) {
            const auditedModels = [
                "User",
                "Organisation",
                "Currency",
                "Country",
                "Integration",
            ];
            if (!model || !auditedModels.includes(model)) {
                return query(args);
            }
            const requestId = args?.data?.requestId || args?.where?.requestId || (0, exports.generateRequestId)();
            const context = contextStore[requestId] || {
                userId: undefined,
                organizationId: undefined,
                ipAddress: undefined,
                requestId: requestId,
                userAgent: undefined,
                metadata: {},
            };
            let before = null;
            if (operation === "update" || operation === "delete") {
                try {
                    const whereClause = args.where;
                    if (whereClause && (whereClause.id || whereClause.email)) {
                        const basePrisma = new client_1.PrismaClient();
                        before = await basePrisma[model.toLowerCase()].findUnique({
                            where: whereClause,
                        });
                        await basePrisma.$disconnect();
                    }
                }
                catch (error) {
                    console.error("Error capturing before state:", error);
                }
            }
            const result = await query(args);
            const actionMap = {
                create: "CREATE",
                update: "UPDATE",
                delete: "DELETE",
                createMany: "CREATE_MANY",
                updateMany: "UPDATE_MANY",
                deleteMany: "DELETE_MANY",
            };
            const auditAction = actionMap[operation];
            if (auditAction) {
                try {
                    const auditData = {
                        user_id: context.userId || null,
                        entity_type: model,
                        entity_id: getEntityId(operation, args, result),
                        action: auditAction,
                        organisation_id: context.organizationId ||
                            result?.organisation_id ||
                            before?.organisation_id ||
                            null,
                        ip_address: context.ipAddress || null,
                        request_id: context.requestId || requestId,
                        created_at: new Date(),
                    };
                    if (operation === "create") {
                        auditData.data = sanitizeData(args.data);
                    }
                    if (operation === "update" && before && result) {
                        const changes = computeChanges(before, result);
                        if (changes && Object.keys(changes).length > 0) {
                            auditData.changes = changes;
                        }
                    }
                    auditData.metadata = {
                        model,
                        operation,
                        timestamp: new Date().toISOString(),
                        userAgent: context.userAgent,
                        integrationMode: result?.integration_mode || before?.integration_mode || "unknown",
                        ...context.metadata,
                    };
                    setImmediate(async () => {
                        try {
                            await prisma.userActivity.create({ data: auditData });
                        }
                        catch (error) {
                            console.error("Error writing audit log:", error);
                        }
                    });
                }
                catch (error) {
                    console.error("Error in audit extension:", error);
                }
            }
            delete contextStore[requestId];
            return result;
        },
    },
});
function getEntityId(operation, args, result) {
    if (operation === "create" && result?.id) {
        return result.id;
    }
    if (args?.where?.id) {
        return args.where.id;
    }
    if (args?.where?.email) {
        return args.where.email;
    }
    if (operation.includes("Many")) {
        return `bulk_${operation}_${Date.now()}`;
    }
    return "unknown";
}
function sanitizeData(data) {
    if (!data)
        return null;
    const sensitiveFields = [
        "password",
        "api_secret",
        "webhook_secret",
        "api_key",
        "token",
    ];
    const sanitized = { ...data };
    sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
            sanitized[field] = "[REDACTED]";
        }
    });
    return sanitized;
}
function computeChanges(before, after) {
    const changes = {};
    const fieldsToTrack = [
        "email",
        "first_name",
        "last_name",
        "role",
        "status",
        "phone",
        "address",
        "name",
        "description",
        "type",
        "integration_mode",
        "contact_person",
        "contact_email",
        "contact_phone",
        "contact_address",
        "contact_city",
        "contact_state",
        "contact_zip",
        "currency_name",
        "currency_code",
        "currency_symbol",
        "country_name",
        "country_code",
    ];
    for (const field of fieldsToTrack) {
        if (before[field] !== after[field] &&
            before[field] !== undefined &&
            after[field] !== undefined) {
            changes[field] = {
                old: before[field],
                new: after[field],
            };
        }
    }
    return Object.keys(changes).length > 0 ? changes : null;
}
exports.default = prisma;
//# sourceMappingURL=prisma.middleware.js.map