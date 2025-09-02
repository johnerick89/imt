# Audit Trail System

This document describes the comprehensive audit trail system implemented in the IMT Money Transfer application.

## Overview

The audit trail system automatically tracks all changes to audited entities in the database, providing a complete history of who did what, when, and from where.

## Features

- **Automatic Tracking**: All CRUD operations on audited models are automatically logged
- **User Context**: Tracks which user performed each action
- **IP Address Tracking**: Records the IP address of the request
- **Change Detection**: For updates, tracks exactly what changed
- **Request Correlation**: Links related operations with request IDs
- **Data Sanitization**: Automatically redacts sensitive information
- **Performance Optimized**: Audit logging is asynchronous and doesn't slow down operations

## Audited Models

The following models are currently audited:

- **User**: All user management operations
- **Organisation**: Organization management operations
- **Currency**: Currency configuration changes
- **Country**: Country data modifications
- **Integration**: Integration setup and configuration

## Database Schema

### UserActivity Table

```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- Optional for system operations
  entity_type VARCHAR NOT NULL,
  entity_id VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  data JSONB,
  organisation_id UUID REFERENCES organisations(id),
  changes JSONB,
  ip_address VARCHAR,
  request_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## How It Works

### 1. Request Context Setup

The `auditMiddleware` sets up context for each request:

```typescript
// Automatically called for each request
auditMiddleware(req, res, next) {
  const requestId = generateRequestId();
  const context = {
    userId: req.user?.id,
    organizationId: req.user?.organisation_id,
    ipAddress: req.ip,
    requestId,
    userAgent: req.get("User-Agent"),
    metadata: { method: req.method, url: req.url }
  };
  setPrismaContext(requestId, context);
}
```

### 2. Automatic Audit Logging

The Prisma extension automatically intercepts all database operations:

```typescript
const prisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ operation, args, query, model }) {
      // Check if model should be audited
      if (!auditedModels.includes(model)) {
        return query(args);
      }

      // Capture before state for updates/deletes
      let before = null;
      if (operation === "update" || operation === "delete") {
        const basePrisma = new PrismaClient();
        before = await basePrisma[model.toLowerCase()].findUnique({
          where: args.where,
        });
        await basePrisma.$disconnect();
      }

      // Execute the operation
      const result = await query(args);

      // Create audit log
      const auditData = {
        user_id: context.userId,
        entity_type: model,
        entity_id: getEntityId(operation, args, result),
        action: actionMap[operation],
        data: operation === "create" ? sanitizeData(args.data) : null,
        changes: operation === "update" ? computeChanges(before, result) : null,
        organisation_id: context.organizationId,
        ip_address: context.ipAddress,
        request_id: context.requestId,
        metadata: { model, operation },
      };

      // Log asynchronously
      setImmediate(() => prisma.userActivity.create({ data: auditData }));
    },
  },
});
```

## Usage Examples

### 1. Viewing Audit Logs

```typescript
// Get all audit logs with pagination
const auditLogs = await auditService.getAuditLogs({
  page: 1,
  limit: 10,
  entityType: "User",
  action: "UPDATE",
});

// Get audit history for a specific entity
const userHistory = await auditService.getEntityAuditHistory(
  "User",
  "user-id-123"
);

// Get audit history for a specific user
const userActions = await auditService.getUserAuditHistory("user-id-123", {
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-12-31"),
});
```

### 2. Audit Log Structure

```typescript
interface AuditLog {
  id: string;
  user_id: string;
  entity_type: string; // "User", "Organisation", etc.
  entity_id: string; // ID of the affected entity
  action: string; // "CREATE", "UPDATE", "DELETE"
  data?: any; // Data for create operations
  organisation_id?: string; // Associated organization
  changes?: any; // Changes for update operations
  ip_address?: string; // IP address of the request
  request_id?: string; // Unique request identifier
  metadata?: any; // Additional context
  created_at: Date; // When the action occurred
  user?: {
    // User who performed the action
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  organisation?: {
    // Associated organization details
    id: string;
    name: string;
  };
}
```

### 3. Change Tracking Example

For update operations, the system tracks exactly what changed:

```typescript
// Example audit log for a user update
{
  "id": "audit-log-id",
  "user_id": "performing-user-id",
  "entity_type": "User",
  "entity_id": "target-user-id",
  "action": "UPDATE",
  "changes": {
    "email": {
      "old": "old@example.com",
      "new": "new@example.com"
    },
    "status": {
      "old": "ACTIVE",
      "new": "INACTIVE"
    }
  },
  "ip_address": "192.168.1.100",
  "request_id": "req-123",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Security Features

### 1. Data Sanitization

Sensitive fields are automatically redacted:

```typescript
const sensitiveFields = [
  "password",
  "api_secret",
  "webhook_secret",
  "api_key",
  "token",
];

// These fields are replaced with "[REDACTED]" in audit logs
```

### 2. Request Correlation

Each request gets a unique ID that links all operations:

```typescript
// Response headers include request ID for debugging
res.setHeader("X-Request-ID", requestId);
```

### 3. Context Cleanup

Context is automatically cleaned up after each request:

```typescript
res.on("finish", () => {
  clearPrismaContext(requestId);
});
```

## Adding New Audited Models

To add audit tracking to a new model:

1. **Add to audited models list** in `prisma.middleware.ts`:

```typescript
const auditedModels = [
  "User",
  "Organisation",
  "Currency",
  "Country",
  "Integration",
  "YourNewModel", // Add here
];
```

2. **Add fields to track** in the `computeChanges` function:

```typescript
const fieldsToTrack = [
  // ... existing fields
  "your_new_field_1",
  "your_new_field_2",
];
```

3. **Add sensitive fields** if needed:

```typescript
const sensitiveFields = [
  // ... existing fields
  "your_sensitive_field",
];
```

## Performance Considerations

- **Asynchronous Logging**: Audit logs are written asynchronously using `setImmediate()`
- **Selective Tracking**: Only specified models are audited
- **Efficient Queries**: Before state is only captured when needed
- **Indexed Fields**: Key fields are indexed for fast queries

## Monitoring and Alerts

The audit system can be used for:

- **Security Monitoring**: Track suspicious activities
- **Compliance**: Maintain audit trails for regulatory requirements
- **Debugging**: Correlate issues with specific requests
- **Analytics**: Understand user behavior patterns

## Best Practices

1. **Regular Cleanup**: Consider archiving old audit logs
2. **Monitoring**: Set up alerts for unusual activity patterns
3. **Backup**: Ensure audit logs are backed up separately
4. **Access Control**: Limit access to audit logs to authorized personnel
5. **Retention Policy**: Define how long to keep audit logs

## Troubleshooting

### Common Issues

1. **Missing Context**: Ensure `auditMiddleware` is called before protected routes
2. **Performance Issues**: Check if too many models are being audited
3. **Missing Logs**: Verify the model is in the `auditedModels` list
4. **Sensitive Data**: Check if new sensitive fields need to be added to sanitization

### Debugging

Use the request ID to trace operations:

```typescript
// In logs, look for the request ID
console.log(
  `Request ${requestId}: Processing ${params.action} on ${params.model}`
);
```

The audit trail system provides comprehensive tracking of all system activities while maintaining performance and security.
