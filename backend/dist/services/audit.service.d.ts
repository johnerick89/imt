export interface AuditFilters {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    organisationId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export interface AuditLog {
    id: string;
    user_id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    data?: any;
    organisation_id?: string;
    changes?: any;
    ip_address?: string;
    request_id?: string;
    metadata?: any;
    created_at: Date;
    user?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    organisation?: {
        id: string;
        name: string;
    };
}
export declare class AuditService {
    getAuditLogs(filters?: AuditFilters): Promise<{
        success: boolean;
        message: string;
        data: {
            auditLogs: ({
                organisation: {
                    id: string;
                    name: string;
                } | null;
                user: {
                    email: string;
                    id: string;
                    first_name: string;
                    last_name: string;
                } | null;
            } & {
                id: string;
                created_at: Date;
                organisation_id: string | null;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                user_id: string | null;
                entity_type: string;
                entity_id: string;
                action: string;
                changes: import("@prisma/client/runtime/library").JsonValue | null;
                ip_address: string | null;
                request_id: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAuditLogById(id: string): Promise<{
        success: boolean;
        message: string;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            organisation: {
                id: string;
                name: string;
            } | null;
            user: {
                email: string;
                id: string;
                first_name: string;
                last_name: string;
            } | null;
        } & {
            id: string;
            created_at: Date;
            organisation_id: string | null;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            user_id: string | null;
            entity_type: string;
            entity_id: string;
            action: string;
            changes: import("@prisma/client/runtime/library").JsonValue | null;
            ip_address: string | null;
            request_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
        error?: undefined;
    }>;
    getEntityAuditHistory(entityType: string, entityId: string): Promise<{
        success: boolean;
        message: string;
        data: ({
            organisation: {
                id: string;
                name: string;
            } | null;
            user: {
                email: string;
                id: string;
                first_name: string;
                last_name: string;
            } | null;
        } & {
            id: string;
            created_at: Date;
            organisation_id: string | null;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            user_id: string | null;
            entity_type: string;
            entity_id: string;
            action: string;
            changes: import("@prisma/client/runtime/library").JsonValue | null;
            ip_address: string | null;
            request_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    }>;
    getUserAuditHistory(userId: string, filters?: AuditFilters): Promise<{
        success: boolean;
        message: string;
        data: {
            auditLogs: ({
                organisation: {
                    id: string;
                    name: string;
                } | null;
            } & {
                id: string;
                created_at: Date;
                organisation_id: string | null;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                user_id: string | null;
                entity_type: string;
                entity_id: string;
                action: string;
                changes: import("@prisma/client/runtime/library").JsonValue | null;
                ip_address: string | null;
                request_id: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAuditStats(): Promise<{
        success: boolean;
        message: string;
        data: {
            totalLogs: number;
            todayLogs: number;
            uniqueUsers: number;
            topActions: {
                action: string;
                count: number;
            }[];
        };
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map