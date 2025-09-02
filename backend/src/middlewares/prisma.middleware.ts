import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import CustomReq from "../types/CustomReq.type";

// Global context store to pass request data to Prisma middleware
const contextStore: { [requestId: string]: CustomReq["prismaContext"] } = {};

// Set context for a request
export const setPrismaContext = (
  requestId: string,
  context: CustomReq["prismaContext"]
) => {
  contextStore[requestId] = context;
};

// Clear context after request
export const clearPrismaContext = (requestId: string) => {
  delete contextStore[requestId];
};

// Generate request ID
export const generateRequestId = () => uuidv4();

// Create Prisma client with audit extension
const prisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ operation, args, query, model }) {
      // Models to audit
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

      // Get context from store
      const requestId =
        args?.data?.requestId || args?.where?.requestId || generateRequestId();
      const context = contextStore[requestId] || {
        userId: undefined,
        organizationId: undefined,
        ipAddress: undefined,
        requestId: requestId,
        userAgent: undefined,
        metadata: {},
      };

      // Capture before state for updates/deletes
      let before: any = null;
      if (operation === "update" || operation === "delete") {
        try {
          const whereClause = args.where;
          if (whereClause && (whereClause.id || whereClause.email)) {
            // Use the base Prisma client for the before query
            const basePrisma = new PrismaClient();
            before = await (basePrisma as any)[model.toLowerCase()].findUnique({
              where: whereClause,
            });
            await basePrisma.$disconnect();
          }
        } catch (error) {
          console.error("Error capturing before state:", error);
        }
      }

      // Execute the query
      const result = await query(args);

      // Map Prisma operations to audit actions
      const actionMap: { [key: string]: string } = {
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
          // Prepare audit data
          const auditData: any = {
            user_id: context.userId || null, // Allow null for system actions
            entity_type: model,
            entity_id: getEntityId(operation, args, result),
            action: auditAction,
            organisation_id:
              context.organizationId ||
              result?.organisation_id ||
              before?.organisation_id ||
              null,
            ip_address: context.ipAddress || null,
            request_id: context.requestId || requestId,
            created_at: new Date(),
          };

          // Add data for create operations
          if (operation === "create") {
            auditData.data = sanitizeData(args.data);
          }

          // Add changes for update operations
          if (operation === "update" && before && result) {
            const changes = computeChanges(before, result);
            if (changes && Object.keys(changes).length > 0) {
              auditData.changes = changes;
            }
          }

          // Add metadata
          auditData.metadata = {
            model,
            operation,
            timestamp: new Date().toISOString(),
            userAgent: context.userAgent,
            integrationMode:
              result?.integration_mode || before?.integration_mode || "unknown",
            ...context.metadata,
          };

          // Write audit log asynchronously
          setImmediate(async () => {
            try {
              await prisma.userActivity.create({ data: auditData });
            } catch (error) {
              console.error("Error writing audit log:", error);
            }
          });
        } catch (error) {
          console.error("Error in audit extension:", error);
        }
      }

      // Clean up context
      delete contextStore[requestId];
      return result;
    },
  },
});

// Helper to get entity ID from operation, args, or result
function getEntityId(operation: string, args: any, result: any): string {
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

// Helper to sanitize data
function sanitizeData(data: any): any {
  if (!data) return null;
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

// Helper to compute changes
function computeChanges(before: any, after: any): any {
  const changes: any = {};
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
    if (
      before[field] !== after[field] &&
      before[field] !== undefined &&
      after[field] !== undefined
    ) {
      changes[field] = {
        old: before[field],
        new: after[field],
      };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}

export default prisma;
